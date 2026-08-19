import { z } from 'zod';

export const approveSchema = z.object({
  maxTurnaroundHours: z.number().int().positive().optional(),
});