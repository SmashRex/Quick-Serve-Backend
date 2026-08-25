import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatPartner } from '../../utils/formatters.js';
import { createNotification } from '../../services/notifications.service.js';

export async function approvePartner(partnerId, maxTurnaroundHours) {
  const partner = await db('partners').where({ id: partnerId }).first();
  if (!partner) {
    throw new ApiError(404, 'Partner not found.');
  }
  if (partner.status !== 'onboarding') {
    throw new ApiError(400, `Partner cannot be approved from status "${partner.status}".`);
  }
  if (!partner.email_verified_at) {
    throw new ApiError(400, 'Partner must verify their email before approval.');
  }

  const updates = { status: 'active', updated_at: new Date() };
  if (maxTurnaroundHours !== undefined) {
    updates.max_turnaround_hours = maxTurnaroundHours;
  }

  const [updated] = await db('partners').where({ id: partnerId }).update(updates).returning('*');
  return formatPartner(updated);
}

function formatPartnerDetail(row) {
  return {
    id: row.id,
    businessName: row.business_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    maxTurnaroundHours: row.max_turnaround_hours,
    emailVerifiedAt: row.email_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPartners({ status, page = 1, limit = 20 }) {
  const query = db('partners');
  if (status) query.where('status', status);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const offset = (page - 1) * limit;
  const partners = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

  return {
    data: partners.map(formatPartnerDetail),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPartnerById(partnerId) {
  const partner = await db('partners').where({ id: partnerId }).first();
  if (!partner) throw new ApiError(404, 'Partner not found.');
  return formatPartnerDetail(partner);
}

export async function updatePartner(partnerId, updates) {
  const partner = await db('partners').where({ id: partnerId }).first();
  if (!partner) throw new ApiError(404, 'Partner not found.');

  const allowedUpdates = {};
  if (updates.status !== undefined) allowedUpdates.status = updates.status;
  if (updates.maxTurnaroundHours !== undefined) allowedUpdates.max_turnaround_hours = updates.maxTurnaroundHours;

  if (Object.keys(allowedUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided to update.');
  }

  allowedUpdates.updated_at = new Date();

  const [updated] = await db('partners').where({ id: partnerId }).update(allowedUpdates).returning('*');
  return formatPartnerDetail(updated);
}

export async function rejectPartner(partnerId, reason) {
  const partner = await db('partners').where({ id: partnerId }).first();
  if (!partner) throw new ApiError(404, 'Partner not found.');
  if (partner.status !== 'onboarding') {
    throw new ApiError(400, `Partner cannot be rejected from status "${partner.status}".`);
  }

  const [updated] = await db('partners')
    .where({ id: partnerId })
    .update({ status: 'rejected', updated_at: new Date() })
    .returning('*');

  // Reuse the notification system from Phase 10 — the partner should know
  // their application was rejected, same as they'd be notified of approval
  // implicitly via being able to log in.
  await createNotification({
    recipientType: 'partner',
    recipientId: partnerId,
    type: 'partner_rejected',
    message: reason ? `Your partner application was not approved: ${reason}` : 'Your partner application was not approved.',
  });

  return formatPartnerDetail(updated);
}