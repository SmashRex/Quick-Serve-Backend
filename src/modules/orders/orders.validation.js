import { z } from 'zod';

const orderItemSchema = z.object({
  itemType: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z
  .object({
    serviceType: z.enum(['dry_clean', 'wash_fold', 'launder_press']),
    pickupAddressId: z.string().uuid(),
    deliveryAddressId: z.string().uuid().optional(),
    scheduledPickupStart: z.string().datetime(),
    scheduledPickupEnd: z.string().datetime(),
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
    idempotencyKey: z.string().min(1).optional(),
  })
  .refine((data) => new Date(data.scheduledPickupEnd) > new Date(data.scheduledPickupStart), {
    message: 'scheduledPickupEnd must be after scheduledPickupStart',
    path: ['scheduledPickupEnd'],
  })
  .refine((data) => new Date(data.scheduledPickupStart) > new Date(), {
    message: 'scheduledPickupStart must be in the future',
    path: ['scheduledPickupStart'],
  })
  .refine(
    (data) =>
      new Date(data.scheduledPickupEnd) - new Date(data.scheduledPickupStart) <= 4 * 60 * 60 * 1000,
    { message: 'Pickup window cannot exceed 4 hours', path: ['scheduledPickupEnd'] }
  );