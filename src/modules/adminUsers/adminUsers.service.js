import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

function formatAdminUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    roleTier: row.role_tier,
    createdAt: row.created_at,
  };
}

export async function createAdmin({ fullName, email, password, roleTier }) {
  const existing = await db('admin_users').where({ email }).first();
  if (existing) {
    throw new ApiError(400, 'An admin account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [admin] = await db('admin_users')
    .insert({ full_name: fullName, email, password_hash: passwordHash, role_tier: roleTier })
    .returning('*');

  return formatAdminUser(admin);
}