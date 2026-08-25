import { rateLimit } from 'express-rate-limit';

function buildLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ message, error: 'Too Many Requests', statusCode: 429 });
    },
  });
}

export const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

export const forgotPasswordLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  message: 'Too many password reset requests. Please try again in an hour.',
});

export const signupLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  message: 'Too many signup attempts. Please try again later.',
});