import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { generateVerificationToken, generateAccessToken, generateRefreshToken } from '../../utils/tokens.js';
import { formatPartner } from '../../utils/formatters.js';

const SALT_ROUNDS = 10;
const VERIFICATION_EXPIRY_HOURS = 24;

export async function onboardPartner({ businessName, email, password, phone, maxTurnaroundHours }) {
  const existing = await db('partners').where({ email }).first();
  if (existing) {
    throw new ApiError(409, 'A partner account with this email already exists.');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const [partner] = await db('partners')
    .insert({
      business_name: businessName,
      email,
      password_hash,
      contact_phone: phone,
      status: 'onboarding',
      max_turnaround_hours: maxTurnaroundHours,
    })
    .returning('*');

  const { rawToken, tokenHash } = generateVerificationToken();
  const expires_at = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  await db('partner_verification_tokens').insert({
    partner_id: partner.id,
    token_hash: tokenHash,
    expires_at,
  });

  console.log(`[PARTNER VERIFICATION LINK] http://localhost:3000/partner-auth/verify?token=${rawToken}`);

  return formatPartner(partner);
}

export async function verifyPartnerEmail(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await db('partner_verification_tokens').where({ token_hash: tokenHash }).first();

  if (!record || record.used_at) {
    throw new ApiError(400, 'Invalid or already-used verification link.');
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new ApiError(400, 'This verification link has expired.');
  }

  await db('partners').where({ id: record.partner_id }).update({ email_verified_at: new Date() });
  await db('partner_verification_tokens').where({ id: record.id }).update({ used_at: new Date() });

  return { message: 'Email verified successfully. You can now log in once approved by ops.' };
}

export async function login(email, password) {
  const partner = await db('partners').where({ email }).first();
  if (!partner) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, partner.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!partner.email_verified_at) {
    throw new ApiError(401, 'Please verify your email before logging in.');
  }

  if (partner.status !== 'active') {
    throw new ApiError(401, `Your account is not yet approved (status: "${partner.status}"). Please wait for ops approval.`);
  }

  const tokenPayload = { id: partner.id, role: 'partner' };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
}