import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.string().or(z.number()).transform((val) => Number(val)),
  stockQuantity: z.number().int().nonnegative().default(0),
  allowOnOrder: z.boolean().optional().default(false),
  onOrderQuantity: z.number().int().nonnegative().optional().default(0),
  categoryId: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().refine((val) => val === '' || val.startsWith('/assets/') || val.startsWith('http://') || val.startsWith('https://'), { message: 'Invalid image path' }).optional().or(z.literal('')),
  images: z.array(z.object({
    color: z.string().optional(),
    imageUrl: z.string()
  })).optional().default([]),
  sizes: z.array(z.string()).optional().default([]),   // e.g. ["S", "M"]
  colors: z.array(z.string()).optional().default([]), // e.g. ["Red", "Black"]
  tags: z.array(z.string()).optional().default([]),   // e.g. ["new", "basics"]
  status: z.enum(['active', 'inactive']).optional().default('active'),
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  isBestSeller: z.boolean().optional().default(false),
});

export const GetProductsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 100)),
  categorySlug: z.string().optional().transform((val) => (val ? val.split(',') : undefined)),
  collection: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  sizes: z.string().optional().transform((val) => (val ? val.split(',') : undefined)),   // e.g. "S,M" -> ["S", "M"]
  colors: z.string().optional().transform((val) => (val ? val.split(',') : undefined)), // e.g. "Red,Black" -> ["Red", "Black"]
  tags: z.string().optional().transform((val) => (val ? val.split(',') : undefined)),   // e.g. "cool,new" -> ["cool", "new"]
  query: z.string().optional(),
});

export const CreateProductCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
});

export const CreateProductTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  slug: z.string().min(1, 'Tag slug is required'),
});

export type CreateProductCategoryDto = z.infer<typeof CreateProductCategorySchema>;
export type CreateProductTagDto = z.infer<typeof CreateProductTagSchema>;

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type GetProductsQueryDto = z.infer<typeof GetProductsQuerySchema>;
export type UpdateProductDto = Partial<CreateProductDto>;


