import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatRider } from '../../utils/formatters.js';

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