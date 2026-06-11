import { mysqlTable, bigint, varchar, text, timestamp } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';

export const blogCategories = mysqlTable('blog_categories', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const blogs = mysqlTable('blogs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: varchar('summary', { length: 500 }),
  content: text('content').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  authorId: bigint('author_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }),
  categoryId: bigint('category_id', { mode: 'number' }).references(() => blogCategories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
