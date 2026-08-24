import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';

function formatNotification(row) {
  return {
    id: row.id,
    recipientType: row.recipient_type,
    type: row.type,
    message: row.message,
    orderId: row.order_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

/**
 * Creates a notification. Called from other services (rider status updates,
 * dispute resolution, payout mark-paid, etc.) — never called directly from
 * a route/controller.
 */
export async function createNotification({ recipientType, recipientId, type, message, orderId = null }) {
  await db('notifications').insert({
    recipient_type: recipientType,
    recipient_id: recipientId,
    type,
    message,
    order_id: orderId,
  });
}

export async function getNotifications(recipientType, recipientId, { unreadOnly = false } = {}) {
  const query = db('notifications').where({ recipient_type: recipientType, recipient_id: recipientId });
  if (unreadOnly) query.whereNull('read_at');

  const notifications = await query.orderBy('created_at', 'desc');
  return notifications.map(formatNotification);
}

export async function markAsRead(recipientType, recipientId, notificationId) {
  const notification = await db('notifications').where({ id: notificationId }).first();
  if (!notification) throw new ApiError(404, 'Notification not found.');
  if (notification.recipient_type !== recipientType || notification.recipient_id !== recipientId) {
    throw new ApiError(403, 'This notification does not belong to you.');
  }

  const [updated] = await db('notifications')
    .where({ id: notificationId })
    .update({ read_at: new Date() })
    .returning('*');

  return formatNotification(updated);
}