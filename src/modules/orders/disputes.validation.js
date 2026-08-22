import { z } from 'zod';

export const createDisputeSchema = z.object({
  reason: z.string().min(10, 'Please provide a more detailed reason (at least 10 characters).'),
});