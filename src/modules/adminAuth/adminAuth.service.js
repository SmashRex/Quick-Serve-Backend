import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokens.js';

export async function login(email, password) {
  const admin = await db('admin_users').where({ email }).first();
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const tokenPayload = { id: admin.id, role: 'admin', roleTier: admin.role_tier };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
}
