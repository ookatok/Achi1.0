import { mysqlTable, bigint, varchar, timestamp, AnyMySqlColumn } from 'drizzle-orm/mysql-core';

export const categories = mysqlTable('categories', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  parentCategoryId: bigint('parent_category_id', { mode: 'number' }).references((): AnyMySqlColumn => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
