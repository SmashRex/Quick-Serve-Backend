import { z } from 'zod';

export const resolveSchema = z.object({
  resolutionNote: z.string().min(1),
});