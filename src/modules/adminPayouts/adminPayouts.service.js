import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

function formatPayout(row) {
  return {
    id: row.id,
    partnerId: row.partner_id,
    orderId: row.order_id,
    amount: row.amount,
    status: row.status,
    markedPaidByAdminId: row.marked_paid_by_admin_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPayouts({ status, partnerId, page = 1, limit = 20 }) {
  const query = db('partner_payouts');
  if (status) query.where('status', status);
  if (partnerId) query.where('partner_id', partnerId);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const offset = (page - 1) * limit;
  const payouts = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

  return {
    data: payouts.map(formatPayout),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function markPaid(payoutId, adminId) {
  const payout = await db('partner_payouts').where({ id: payoutId }).first();
  if (!payout) throw new ApiError(404, 'Payout not found.');
  if (payout.status === 'paid') {
    throw new ApiError(400, 'This payout has already been marked as paid.');
  }

  const [updated] = await db('partner_payouts')
    .where({ id: payoutId })
    .update({
      status: 'paid',
      marked_paid_by_admin_id: adminId,
      paid_at: new Date(),
      updated_at: new Date(),
    })
    .returning('*');

  return formatPayout(updated);
}