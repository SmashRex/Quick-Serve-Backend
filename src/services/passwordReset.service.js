import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { generateVerificationToken } from '../utils/tokens.js';
import { sendEmail } from '../utils/email.js';
import { resetPasswordTemplate } from '../templates/emailTemplates.js';

const RESET_EXPIRY_HOURS = 1;
const SALT_ROUNDS = 10;

const TABLE_BY_TYPE = {
  customer: 'users',
  partner: 'partners',
};

export async function requestPasswordReset(ownerType, email) {
  const table = TABLE_BY_TYPE[ownerType];
  const account = await db(table).where({ email }).first();

  // Deliberately do nothing different if the account doesn't exist — the
  // controller always returns the same generic message regardless, so an
  // attacker can't use this endpoint to check which emails are registered.
  if (!account) return;

  const { rawToken, tokenHash } = generateVerificationToken();
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

  await db('password_reset_tokens').insert({
    owner_type: ownerType,
    owner_id: account.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const resetUrl = `${process.env.APP_BASE_URL}/auth/reset-password?token=${rawToken}`;
    await sendEmail({
    to: email,
    subject: 'Reset your QuickServe password',
    html: resetPasswordTemplate(resetUrl),
  });
}

export async function resetPassword(rawToken, newPassword) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await db('password_reset_tokens').where({ token_hash: tokenHash }).first();
  if (!record || record.used_at) {
    throw new ApiError(400, 'Invalid or already-used reset link.');
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new ApiError(400, 'This reset link has expired.');
  }

  const table = TABLE_BY_TYPE[record.owner_type];
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db(table).where({ id: record.owner_id }).update({ password_hash: passwordHash, updated_at: new Date() });
  await db('password_reset_tokens').where({ id: record.id }).update({ used_at: new Date() });

  return { message: 'Password reset successfully. You can now log in with your new password.' };
}