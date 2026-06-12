import { mysqlTable, bigint, varchar, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { products } from './product.schema';

export const tags = mysqlTable('tags', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const productTags = mysqlTable('product_tags', {
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }),
  tagId: bigint('tag_id', { mode: 'number' }).references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.tagId] }),
}));
