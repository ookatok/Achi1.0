import { z } from 'zod';

export const CreateCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  publishDate: z.string().optional().nullable(),
  productIds: z.array(z.number()).optional().default([]),
  storyTitleEn: z.string().optional().nullable(),
  storyTitleTh: z.string().optional().nullable(),
  storySubtitleEn: z.string().optional().nullable(),
  storySubtitleTh: z.string().optional().nullable(),
  storyParagraphsEn: z.string().optional().nullable(),
  storyParagraphsTh: z.string().optional().nullable(),
  storyImageUrl: z.string().optional().nullable(),
  galleryImages: z.string().optional().nullable(),
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  isVisible: z.boolean().optional().default(false),
  showOnHome: z.boolean().optional().default(false),
});

export type CreateCollectionDto = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionDto = Partial<CreateCollectionDto>;
