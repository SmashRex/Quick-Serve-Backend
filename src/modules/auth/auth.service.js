import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, generateVerificationToken } from '../../utils/tokens.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';


const SALT_ROUNDS = 10;
const VERIFICATION_EXPIRY_HOURS = 24;

export async function signup({ fullName, email, password, phone }) {
  const existing = await db('users').where({ email }).first();
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db('users')
    .insert({ full_name: fullName, email, password_hash, phone: phone || null })
    .returning(['id', 'email']);

  const { rawToken, tokenHash } = generateVerificationToken();
  const expires_at = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  await db('verification_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at,
  });

  // No email provider yet — log the link so we can test manually
  console.log(`[VERIFICATION LINK] http://localhost:3000/auth/verify?token=${rawToken}`);

  return {
    id: user.id,
    email: user.email,
    message: 'Signup successful. Check your email to verify your account.',
  };
}



export async function login({ email, password }) {
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.email_verified_at) {
    throw new ApiError(401, 'Please verify your email before logging in.');
  }

  const payload = { id: user.id, role: 'customer' };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
}

export async function verifyEmail(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await db('verification_tokens').where({ token_hash: tokenHash }).first();

  if (!record) {
    throw new ApiError(400, 'Invalid or already-used verification link.');
  }
  if (record.used_at) {
    throw new ApiError(400, 'Invalid or already-used verification link.');
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new ApiError(400, 'This verification link has expired.');
  }

  await db('users').where({ id: record.user_id }).update({ email_verified_at: new Date() });
  await db('verification_tokens').where({ id: record.id }).update({ used_at: new Date() });

  return { message: 'Email verified successfully. You can now log in.' };
}

export async function getCurrentUser(userId) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new ApiError(401, 'User not found.');
  }

  return {
    userId: user.id,
    email: user.email,
    role: 'customer',
  };
}



export async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  const user = await db('users').where({ id: decoded.id }).first();
  if (!user) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  const payload = { id: user.id, role: 'customer' };
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken: newRefreshToken };
}