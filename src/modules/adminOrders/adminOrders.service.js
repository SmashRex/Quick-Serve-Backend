import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatOrder } from '../../utils/formatters.js';
import { assertValidTransition } from '../../services/orderTransitions.service.js';
import { createNotification } from '../../services/notifications.service.js';

const ASSIGNABLE_ASSIGNMENT_TYPES = ['pickup', 'delivery'];

export async function assignRider(orderId, riderId, assignmentType, assignedByAdminId) {
  if (!ASSIGNABLE_ASSIGNMENT_TYPES.includes(assignmentType)) {
    throw new ApiError(400, `"assignmentType" must be one of: ${ASSIGNABLE_ASSIGNMENT_TYPES.join(', ')}.`);
  }

  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const rider = await db('riders').where({ id: riderId }).first();
  if (!rider) throw new ApiError(404, 'Rider not found.');

  const column = assignmentType === 'pickup' ? 'pickup_rider_id' : 'delivery_rider_id';

  const updated = await db.transaction(async (trx) => {
    const [updatedOrder] = await trx('orders')
      .where({ id: orderId })
      .update({ [column]: riderId, updated_at: new Date() })
      .returning('*');

    // Only advance the state machine on a PICKUP assignment where the current
    // status genuinely allows it — checked against order_transitions itself,
    // not a hand-rolled duplicate of that rule.
    if (assignmentType === 'pickup') {
      const rule = await trx('order_transitions')
        .where({ from_status: order.current_status, to_status: 'rider_assigned' })
        .first();

      if (rule) {
        await trx('orders')
          .where({ id: orderId })
          .update({ current_status: 'rider_assigned' });

        await trx('order_status_history').insert({
          order_id: orderId,
          from_status: order.current_status,
          to_status: 'rider_assigned',
          changed_by_type: 'ops',
          changed_by_id: assignedByAdminId,
        });

        updatedOrder.current_status = 'rider_assigned';
      }
      // If no rule matches (order isn't in order_placed), we silently skip
      // advancing status — the rider gets assigned to the column either way,
      // but the state machine only moves if the table says it's allowed to.
    }

    return updatedOrder;
  });

    await createNotification({
    recipientType: 'rider',
    recipientId: riderId,
    type: 'order_assigned',
    message: `You've been assigned a ${assignmentType} for order #${orderId}.`,
    orderId,
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

    await createNotification({
    recipientType: 'partner',
    recipientId: partnerId,
    type: 'order_assigned',
    message: `A new order has been sent to you for cleaning.`,
    orderId,
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

export async function getOrders({ status, partnerId, riderId, page = 1, limit = 20 }) {
  const query = db('orders');

  if (status) {
    query.where('current_status', status);
  }
  if (partnerId) {
    query.where('partner_id', partnerId);
  }
  if (riderId) {
    query.where(function () {
      this.where('pickup_rider_id', riderId).orWhere('delivery_rider_id', riderId);
    });
  }

  // Clone before pagination so the count reflects the same filters, not the paginated slice.
  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const offset = (page - 1) * limit;
  const orders = await query
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    data: orders.map((o) => formatOrder(o)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOrderProofPhotos(orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const items = await db('order_items').where({ order_id: orderId });

  return {
    orderId: order.id,
    items: items.map((item) => ({
      itemId: item.id,
      description: item.description,
      pickupPhotoUrl: item.pickup_photo_url,
      deliveryPhotoUrl: item.delivery_photo_url,
    })),
  };
}