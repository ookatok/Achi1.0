import { mysqlTable, bigint, varchar, timestamp, text } from 'drizzle-orm/mysql-core';
import { products } from './product.schema';

export const collections = mysqlTable('collections', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  imageUrl: varchar('image_url', { length: 500 }),
  publishDate: timestamp('publish_date'),
  storyTitleEn: varchar('story_title_en', { length: 500 }),
  storyTitleTh: varchar('story_title_th', { length: 500 }),
  storySubtitleEn: varchar('story_subtitle_en', { length: 1000 }),
  storySubtitleTh: varchar('story_subtitle_th', { length: 1000 }),
  storyParagraphsEn: text('story_paragraphs_en'),
  storyParagraphsTh: text('story_paragraphs_th'),
  storyImageUrl: varchar('story_image_url', { length: 500 }),
  galleryImages: text('gallery_images'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const collectionProducts = mysqlTable('collection_products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  collectionId: bigint('collection_id', { mode: 'number' }).references(() => collections.id, { onDelete: 'cascade' }),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }),
});
