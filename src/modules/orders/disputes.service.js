import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

export async function createDispute(customerId, orderId, reason) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customer_id !== customerId) {
    throw new ApiError(403, 'You do not have permission to dispute this order.');
  }
  if (order.current_status === 'disputed') {
    throw new ApiError(400, 'This order already has an open dispute.');
  }

  const [dispute] = await db('disputes')
    .insert({
      order_id: orderId,
      raised_by_type: 'customer',
      raised_by_id: customerId,
      reason,
      status: 'open',
      status_at_dispute: order.current_status,
    })
    .returning('*');

  await db('orders').where({ id: orderId }).update({ current_status: 'disputed', updated_at: new Date() });

  return formatDispute(dispute);
}

export function formatDispute(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    raisedByType: row.raised_by_type,
    raisedById: row.raised_by_id,
    reason: row.reason,
    status: row.status,
    statusAtDispute: row.status_at_dispute,
    resolutionNote: row.resolution_note,
    resolvedByAdminId: row.resolved_by_admin_id,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
