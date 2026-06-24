import { mysqlTable, bigint, timestamp, text, int } from 'drizzle-orm/mysql-core';

export const faqs = mysqlTable('faqs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  questionEn: text('question_en').notNull(),
  questionTh: text('question_th').notNull(),
  answerEn: text('answer_en').notNull(),
  answerTh: text('answer_th').notNull(),
  order: int('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
