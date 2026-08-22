import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

function formatMessage(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    threadType: row.thread_type,
    senderType: row.sender_type,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function assertOrderAccess(orderId, actorType, actorId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  if (actorType === 'customer' && order.customer_id !== actorId) {
    throw new ApiError(403, 'You do not have permission to access this order.');
  }
  if (actorType === 'partner' && order.partner_id !== actorId) {
    throw new ApiError(403, 'You do not have permission to access this order.');
  }

  return order;
}

export async function getThread(orderId, actorType, actorId) {
  await assertOrderAccess(orderId, actorType, actorId);

  const threadType = actorType === 'customer' ? 'customer_thread' : 'partner_thread';

  const messages = await db('messages')
    .where({ order_id: orderId, thread_type: threadType })
    .orderBy('created_at', 'asc');

  return messages.map(formatMessage);
}

export async function postMessage(orderId, actorType, actorId, body) {
  await assertOrderAccess(orderId, actorType, actorId);

  const threadType = actorType === 'customer' ? 'customer_thread' : 'partner_thread';

  const [message] = await db('messages')
    .insert({
      order_id: orderId,
      thread_type: threadType,
      sender_type: actorType,
      sender_id: actorId,
      body,
    })
    .returning('*');

  return formatMessage(message);
}

export { formatMessage };