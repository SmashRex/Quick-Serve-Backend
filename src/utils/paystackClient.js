import { PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL } from '../config/paystack.js';
import ApiError from './ApiError.js';
import crypto from 'crypto';

export async function initializeTransaction({ email, amountKobo, reference }) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new ApiError(502, `Paystack initialization failed: ${data.message || 'Unknown error'}`);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}



export function verifyWebhookSignature(rawBody, signatureHeader) {
  const expectedHash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  return expectedHash === signatureHeader;
}