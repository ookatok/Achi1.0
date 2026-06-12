import { mysqlTable, bigint, varchar, timestamp, text } from 'drizzle-orm/mysql-core';

export const contactRequests = mysqlTable('contact_requests', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  topic: varchar('topic', { length: 100 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
