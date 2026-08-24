import { z } from 'zod';

export const registerDeviceSchema = z.object({
  pushToken: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']).optional(),
});