import db from '../../config/db.js';
import { formatOrder } from '../../utils/formatters.js';
import ApiError from '../../utils/ApiError.js';
import { assertValidTransition } from '../../services/orderTransitions.service.js';

const TERMINAL_STATUSES = ['delivered', 'cancelled'];

export async function getPartnerOrders(partnerId) {
  const orders = await db('orders')
    .where({ partner_id: partnerId })
    .whereNotIn('current_status', TERMINAL_STATUSES)
    .orderBy('created_at', 'asc');

  return orders.map((o) => formatOrder(o));
}


export async function acceptOrder(partnerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.partner_id !== partnerId) {
    throw new ApiError(403, 'This order is not assigned to you.');
  }

  await assertValidTransition(order.current_status, 'at_partner', 'partner');

  const partner = await db('partners').where({ id: partnerId }).first();

  const acceptedAt = new Date();
  const slaDeadline = new Date(acceptedAt.getTime() + partner.max_turnaround_hours * 60 * 60 * 1000);

  const updatedOrder = await db.transaction(async (trx) => {
    const [updated] = await trx('orders')
      .where({ id: orderId })
      .update({
        current_status: 'at_partner',
        accepted_at: acceptedAt,
        sla_deadline: slaDeadline,
        updated_at: new Date(),
      })
      .returning('*');

    await trx('order_status_history').insert({
      order_id: orderId,
      from_status: order.current_status,
      to_status: 'at_partner',
      changed_by_type: 'partner',
      changed_by_id: partnerId,
    });

    return updated;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updatedOrder, items);
}

export async function updateOrderStatus(partnerId, orderId, toStatus) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.partner_id !== partnerId) {
    throw new ApiError(403, 'This order is not assigned to you.');
  }

  const fromStatus = order.current_status;

  await assertValidTransition(fromStatus, toStatus, 'partner');

  const updatedOrder = await db.transaction(async (trx) => {
    const [updated] = await trx('orders')
      .where({ id: orderId })
      .update({ current_status: toStatus, updated_at: new Date() })
      .returning('*');

    await trx('order_status_history').insert({
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by_type: 'partner',
      changed_by_id: partnerId,
    });

    return updated;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updatedOrder, items);
}

export async function getOrderSla(partnerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.partner_id !== partnerId) {
    throw new ApiError(403, 'This order is not assigned to you.');
  }
  if (!order.sla_deadline) {
    throw new ApiError(400, 'This order has not been accepted yet — no SLA deadline exists.');
  }

  const now = new Date();
  const deadline = new Date(order.sla_deadline);
  const msRemaining = deadline.getTime() - now.getTime();

  return {
    orderId: order.id,
    acceptedAt: order.accepted_at,
    slaDeadline: order.sla_deadline,
    minutesRemaining: Math.round(msRemaining / 60000),
    isBreached: msRemaining < 0,
  };
}