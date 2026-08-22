import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatDispute } from '../orders/disputes.service.js';

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

  const [updated] = await db('disputes')
    .where({ id: disputeId })
    .update({
      status: 'resolved',
      resolution_note: resolutionNote,
      resolved_by_admin_id: adminId,
      resolved_at: new Date(),
      updated_at: new Date(),
    })
    .returning('*');

  return formatDispute(updated);
}