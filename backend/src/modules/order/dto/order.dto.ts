import { z } from 'zod';

export const CheckoutSchema = z.object({
  shippingAddress: z.string().min(5, 'Shipping address must be at least 5 characters long'),
});

export type CheckoutDto = z.infer<typeof CheckoutSchema>;
