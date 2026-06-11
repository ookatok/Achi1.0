import { z } from 'zod';

export const CreateBlogCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

export type CreateBlogCategoryDto = z.infer<typeof CreateBlogCategorySchema>;

export const CreateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  summary: z.string().max(500).optional().or(z.literal('')),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().optional().or(z.literal('')),
  categoryId: z.number().nullable().optional(),
});

export type CreateBlogDto = z.infer<typeof CreateBlogSchema>;
export type UpdateBlogDto = Partial<CreateBlogDto>;
