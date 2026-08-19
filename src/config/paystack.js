// src/config/paystack.js

const requiredKeys = ["PAYSTACK_SECRET_KEY", "PAYSTACK_PUBLIC_KEY"];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. Check your .env file.`
    );
  }
}

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
export const PAYSTACK_BASE_URL = "https://api.paystack.co";