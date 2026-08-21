import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['cleaning_in_progress', 'ready_for_pickup']),
});


