import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.string().or(z.number()).transform((val) => Number(val)),
  stockQuantity: z.number().int().nonnegative().default(0),
  categoryId: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sizes: z.array(z.string()).optional().default([]),   // e.g. ["S", "M"]
  colors: z.array(z.string()).optional().default([]), // e.g. ["Red", "Black"]
});

export const GetProductsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 10)),
  categorySlug: z.string().optional(),
  collection: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  sizes: z.string().optional().transform((val) => (val ? val.split(',') : undefined)),   // e.g. "S,M" -> ["S", "M"]
  colors: z.string().optional().transform((val) => (val ? val.split(',') : undefined)), // e.g. "Red,Black" -> ["Red", "Black"]
  query: z.string().optional(),
});

export const CreateProductCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
});

export type CreateProductCategoryDto = z.infer<typeof CreateProductCategorySchema>;

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type GetProductsQueryDto = z.infer<typeof GetProductsQuerySchema>;
export type UpdateProductDto = Partial<CreateProductDto>;

