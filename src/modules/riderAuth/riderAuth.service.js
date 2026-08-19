import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokens.js';

export async function login(email, password) {
  const rider = await db('riders').where({ email }).first();
  if (!rider) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, rider.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const tokenPayload = { id: rider.id, role: 'rider' };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
}