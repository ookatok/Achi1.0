import { mysqlTable, bigint, varchar, decimal, int, timestamp, json } from 'drizzle-orm/mysql-core';
import { categories } from './category.schema';

export const products = mysqlTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int('stock_quantity').notNull().default(0),
  categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'set null' }),
  imageUrl: varchar('image_url', { length: 500 }),
  sizes: json('sizes').$type<string[]>(),   // e.g., ["S", "M", "L", "XL"]
  colors: json('colors').$type<string[]>(), // e.g., ["Red", "Blue", "Black"]
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
