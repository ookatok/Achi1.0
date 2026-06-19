import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { products } from './product.schema';

export const collections = mysqlTable('collections', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  imageUrl: varchar('image_url', { length: 500 }),
  publishDate: timestamp('publish_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const collectionProducts = mysqlTable('collection_products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  collectionId: bigint('collection_id', { mode: 'number' }).references(() => collections.id, { onDelete: 'cascade' }),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }),
});
