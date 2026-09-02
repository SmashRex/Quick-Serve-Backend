import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatRider } from '../../utils/formatters.js';

const RIDER_STATUSES = ['offline', 'available', 'on_task'];

export async function createRider(data) {
  const { fullName, email, password, phone } = data;

  const existing = await db('riders').where({ email }).first();
  if (existing) {
    throw new ApiError(400, 'A rider with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [rider] = await db('riders')
    .insert({
      full_name: fullName,
      email,
      password_hash: passwordHash,
      phone: phone || null,
      status: 'offline',
    })
    .returning('*');

  return formatRider(rider);
}


export async function getRiders({ status, page = 1, limit = 20 }) {
  if (status && !RIDER_STATUSES.includes(status)) {
    throw new ApiError(400, `"status" must be one of: ${RIDER_STATUSES.join(', ')}.`);
  }

  const query = db('riders');

  if (status) {
    query.where('status', status);
  }

  // Clone before pagination so the count reflects the same filters, not the paginated slice.
  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const offset = (page - 1) * limit;
  const riders = await query
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    data: riders.map((r) => formatRider(r)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}