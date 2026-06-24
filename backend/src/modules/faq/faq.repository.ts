import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { faqs } from '../../db/schema/faq.schema';
import { eq, asc, desc } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class FaqRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async create(data: typeof faqs.$inferInsert) {
    const result = await this.db.insert(faqs).values(data);
    return result[0].insertId;
  }

  async findAll() {
    return await this.db
      .select()
      .from(faqs)
      .orderBy(asc(faqs.order), desc(faqs.createdAt));
  }

  async findOne(id: number) {
    const results = await this.db
      .select()
      .from(faqs)
      .where(eq(faqs.id, id))
      .limit(1);
    return results[0] || null;
  }

  async update(id: number, data: Partial<typeof faqs.$inferInsert>) {
    await this.db.update(faqs).set(data).where(eq(faqs.id, id));
  }

  async delete(id: number) {
    await this.db.delete(faqs).where(eq(faqs.id, id));
  }
}
