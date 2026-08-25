import { z } from 'zod';

export const createAdminSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  roleTier: z.enum(['dispatcher', 'support', 'finance', 'super_admin']),
});