import { z } from 'zod';

export const CreateCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  publishDate: z.string().optional().nullable(),
  productIds: z.array(z.number()).optional().default([]),
});

export type CreateCollectionDto = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionDto = Partial<CreateCollectionDto>;
