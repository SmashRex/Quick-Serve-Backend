import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatPartner } from '../../utils/formatters.js';

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