import { z } from 'zod';

export const approveSchema = z.object({
  maxTurnaroundHours: z.number().int().positive().optional(),
});

export const updatePartnerSchema = z.object({
  status: z.enum(['onboarding', 'active', 'suspended']).optional(),
  maxTurnaroundHours: z.number().int().positive().optional(),
});

export const rejectSchema = z.object({
  reason: z.string().optional(),
});