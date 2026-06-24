import { mysqlTable, bigint, varchar, decimal, int, timestamp, json, boolean } from 'drizzle-orm/mysql-core';
import { categories } from './category.schema';

export const products = mysqlTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int('stock_quantity').notNull().default(0),
  allowOnOrder: boolean('allow_on_order').notNull().default(false),
  onOrderQuantity: int('on_order_quantity').notNull().default(0),
  categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'set null' }),
  imageUrl: varchar('image_url', { length: 500 }),
  images: json('images').$type<{ color?: string; imageUrl: string }[]>(), // e.g., [{"color": "#94B2E6", "imageUrl": "/assets/uploads/img1.png"}]
  sizes: json('sizes').$type<string[]>(),   // e.g., ["S", "M", "L", "XL"]
  colors: json('colors').$type<string[]>(), // e.g., ["Red", "Blue", "Black"]
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
