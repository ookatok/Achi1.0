import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { blogs, blogCategories } from '../../db/schema/blog.schema';
import { users } from '../../db/schema/user.schema';
import { eq, desc } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class BlogRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  // Blog posts CRUD
  async create(data: typeof blogs.$inferInsert) {
    const result = await this.db.insert(blogs).values(data);
    return result[0].insertId;
  }

  async findAll() {
    return await this.db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        summary: blogs.summary,
        imageUrl: blogs.imageUrl,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        authorName: users.name,
        categoryId: blogs.categoryId,
        categoryName: blogCategories.name,
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
      .orderBy(desc(blogs.createdAt));
  }

  async findOne(id: number) {
    const results = await this.db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        summary: blogs.summary,
        content: blogs.content,
        imageUrl: blogs.imageUrl,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        authorId: blogs.authorId,
        authorName: users.name,
        categoryId: blogs.categoryId,
        categoryName: blogCategories.name,
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
      .where(eq(blogs.id, id))
      .limit(1);

    return results[0] || null;
  }

  async update(id: number, data: Partial<typeof blogs.$inferInsert>) {
    await this.db.update(blogs).set(data).where(eq(blogs.id, id));
  }

  async delete(id: number) {
    await this.db.delete(blogs).where(eq(blogs.id, id));
  }

  // Blog categories CRUD
  async createCategory(data: typeof blogCategories.$inferInsert) {
    const result = await this.db.insert(blogCategories).values(data);
    return result[0].insertId;
  }

  async findAllCategories() {
    return await this.db
      .select()
      .from(blogCategories)
      .orderBy(blogCategories.name);
  }

  async findCategoryById(id: number) {
    const results = await this.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);
    return results[0] || null;
  }

  async deleteCategory(id: number) {
    await this.db.delete(blogCategories).where(eq(blogCategories.id, id));
  }
}
