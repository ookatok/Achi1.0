import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { products } from '../../db/schema/product.schema';
import { categories } from '../../db/schema/category.schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { CreateProductDto, GetProductsQueryDto } from './dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async create(data: typeof products.$inferInsert) {
    const result = await this.db.insert(products).values(data);
    return result[0].insertId;
  }

  async findAll(query: GetProductsQueryDto) {
    const conditions = [];

    if (query.minPrice !== undefined) {
      conditions.push(gte(products.price, String(query.minPrice)));
    }
    if (query.maxPrice !== undefined) {
      conditions.push(lte(products.price, String(query.maxPrice)));
    }

    // Filter using JSON_CONTAINS for clothing sizes
    if (query.sizes && query.sizes.length > 0) {
      const sizeConditions = query.sizes.map(
        (size) => sql`JSON_CONTAINS(${products.sizes}, ${JSON.stringify(size)})`
      );
      conditions.push(and(...sizeConditions));
    }

    // Filter using JSON_CONTAINS for clothing colors
    if (query.colors && query.colors.length > 0) {
      const colorConditions = query.colors.map(
        (color) => sql`JSON_CONTAINS(${products.colors}, ${JSON.stringify(color)})`
      );
      conditions.push(and(...colorConditions));
    }

    const offset = (query.page - 1) * query.limit;

    const baseQuery = this.db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stockQuantity: products.stockQuantity,
        imageUrl: products.imageUrl,
        sizes: products.sizes,
        colors: products.colors,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (query.categorySlug) {
      conditions.push(eq(categories.slug, query.categorySlug));
    }

    return await baseQuery
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(query.limit)
      .offset(offset);
  }

  async findOne(id: number, tx?: any) {
    const client = tx || this.db;
    const results = await client
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stockQuantity: products.stockQuantity,
        imageUrl: products.imageUrl,
        sizes: products.sizes,
        colors: products.colors,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return results[0] || null;
  }

  async update(id: number, data: Partial<typeof products.$inferInsert>, tx?: any) {
    const client = tx || this.db;
    await client.update(products).set(data).where(eq(products.id, id));
  }

  async delete(id: number) {
    await this.db.delete(products).where(eq(products.id, id));
  }
}
