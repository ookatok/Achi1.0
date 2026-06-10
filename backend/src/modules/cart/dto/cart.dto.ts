import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z.number().int().positive('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1').optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
