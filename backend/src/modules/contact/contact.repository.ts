import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { contactRequests } from '../../db/schema/contact.schema';
import { desc } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async create(data: CreateContactDto) {
    const result = await this.db.insert(contactRequests).values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      topic: data.topic,
      description: data.description,
    });
    return result[0].insertId;
  }

  async findAll() {
    return await this.db
      .select()
      .from(contactRequests)
      .orderBy(desc(contactRequests.createdAt));
  }
}
