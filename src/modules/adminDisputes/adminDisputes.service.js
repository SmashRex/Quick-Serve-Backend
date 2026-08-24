import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatDispute } from '../orders/disputes.service.js';
import { createNotification } from '../../services/notifications.service.js';

export async function listDisputes({ status, page = 1, limit = 20 }) {
  const query = db('disputes');
  if (status) query.where('status', status);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const offset = (page - 1) * limit;
  const disputes = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

  return {
    data: disputes.map(formatDispute),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getDisputeById(disputeId) {
  const dispute = await db('disputes').where({ id: disputeId }).first();
  if (!dispute) throw new ApiError(404, 'Dispute not found.');
  return formatDispute(dispute);
}

export async function resolveDispute(disputeId, resolutionNote, adminId) {
  const dispute = await db('disputes').where({ id: disputeId }).first();
  if (!dispute) throw new ApiError(404, 'Dispute not found.');
  if (dispute.status === 'resolved') {
    throw new ApiError(400, 'This dispute has already been resolved.');
  }

  const updated = await db.transaction(async (trx) => {
    const [updatedDispute] = await trx('disputes')
      .where({ id: disputeId })
      .update({
        status: 'resolved',
        resolution_note: resolutionNote,
        resolved_by_admin_id: adminId,
        resolved_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    // Restore the order to whatever status it was in before the dispute was
    // raised, so it isn't permanently stuck in "disputed" once ops has
    // resolved the underlying issue. Only restore if the order is STILL
    // sitting in "disputed" — if something else already moved it (e.g. ops
    // separately cancelled it), we don't want to clobber that.
    const order = await trx('orders').where({ id: dispute.order_id }).first();
    if (order && order.current_status === 'disputed' && dispute.status_at_dispute) {
      await trx('orders')
        .where({ id: dispute.order_id })
        .update({ current_status: dispute.status_at_dispute, updated_at: new Date() });

      await trx('order_status_history').insert({
        order_id: dispute.order_id,
        from_status: 'disputed',
        to_status: dispute.status_at_dispute,
        changed_by_type: 'admin',
        changed_by_id: adminId,
        note: 'Order restored to previous status after dispute resolution.',
      });
    }

    return updatedDispute;
  });

  await createNotification({
  recipientType: dispute.raised_by_type,
  recipientId: dispute.raised_by_id,
  type: 'dispute_resolved',
  message: `Your dispute has been resolved: ${resolutionNote}`,
  orderId: dispute.order_id,
});
  return formatDispute(updated);
}