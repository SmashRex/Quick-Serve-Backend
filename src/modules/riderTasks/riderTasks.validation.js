import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum([
    'picked_up',
    'at_hub',
    'returned_to_hub',
    'out_for_delivery',
    'delivered',
  ]),
});

export const updateAvailabilitySchema = z.object({
  status: z.enum(['offline', 'available', 'on_task']),
});