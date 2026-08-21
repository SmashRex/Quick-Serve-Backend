import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatOrder } from '../../utils/formatters.js';
import { assertValidTransition } from '../../services/orderTransitions.service.js';

const ASSIGNABLE_LEGS = ['pickup', 'delivery'];

export async function assignRider(orderId, riderId, leg) {
  if (!ASSIGNABLE_LEGS.includes(leg)) {
    throw new ApiError(400, `"leg" must be one of: ${ASSIGNABLE_LEGS.join(', ')}.`);
  }

  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const rider = await db('riders').where({ id: riderId }).first();
  if (!rider) throw new ApiError(404, 'Rider not found.');

  const column = leg === 'pickup' ? 'pickup_rider_id' : 'delivery_rider_id';

  const updated = await db.transaction(async (trx) => {
    const [updatedOrder] = await trx('orders')
      .where({ id: orderId })
      .update({ [column]: riderId, updated_at: new Date() })
      .returning('*');

    // Only advance the state machine to rider_assigned on the FIRST (pickup) assignment.
    // Assigning a delivery rider later (order already progressed past pickup) should NOT
    // reset current_status backwards — it's a separate concern from the order's lifecycle stage.
    if (leg === 'pickup' && order.current_status === 'order_placed') {
      await trx('orders')
        .where({ id: orderId })
        .update({ current_status: 'rider_assigned' });

      await trx('order_status_history').insert({
        order_id: orderId,
        from_status: 'order_placed',
        to_status: 'rider_assigned',
        changed_by_type: 'ops',
        changed_by_id: assignedByAdminId, // This should be passed in or determined from context
      });

      updatedOrder.current_status = 'rider_assigned';
    }

    return updatedOrder;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updated, items);
}



export async function assignPartner(orderId, partnerId, assignedByAdminId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const partner = await db('partners').where({ id: partnerId }).first();
  if (!partner) throw new ApiError(404, 'Partner not found.');
  if (partner.status !== 'active') {
    throw new ApiError(400, `Partner is not active (status: "${partner.status}") and cannot be assigned orders.`);
  }

  await assertValidTransition(order.current_status, 'sent_to_partner', 'admin');

  const updatedOrder = await db.transaction(async (trx) => {
    const [updated] = await trx('orders')
      .where({ id: orderId })
      .update({ partner_id: partnerId, current_status: 'sent_to_partner', updated_at: new Date() })
      .returning('*');

    await trx('order_status_history').insert({
      order_id: orderId,
      from_status: order.current_status,
      to_status: 'sent_to_partner',
      changed_by_type: 'admin',
      changed_by_id: assignedByAdminId,
    });

    return updated;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updatedOrder, items);
}


const TERMINAL_STATUSES_FOR_BREACH = ['delivered', 'cancelled'];

export async function getBreachedOrders() {
  const orders = await db('orders')
    .whereNotNull('sla_deadline')
    .where('sla_deadline', '<', new Date())
    .whereNotIn('current_status', TERMINAL_STATUSES_FOR_BREACH)
    .orderBy('sla_deadline', 'asc');

  return orders.map((order) => {
    const msOverdue = new Date().getTime() - new Date(order.sla_deadline).getTime();
    return {
      ...formatOrder(order),
      minutesOverdue: Math.round(msOverdue / 60000),
    };
  });
}