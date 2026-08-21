import { z } from 'zod';

export const onboardSchema = z.object({
  businessName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(1, 'Phone number is required'),
  maxTurnaroundHours: z.number().int().positive(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});