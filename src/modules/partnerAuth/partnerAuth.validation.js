import { z } from 'zod';

export const onboardSchema = z.object({
  businessName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  maxTurnaroundHours: z.number().int().positive(),
});