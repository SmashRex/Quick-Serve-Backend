import { z } from 'zod';

export const assignRiderSchema = z.object({
  riderId: z.string().uuid(),
  leg: z.enum(['pickup', 'delivery']),
});

export const assignPartnerSchema = z.object({
  partnerId: z.string().uuid(),
});