import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { products } from '../../db/schema/product.schema';
import { categories } from '../../db/schema/category.schema';
import { tags, productTags } from '../../db/schema/tag.schema';
import { eq, and, gte, lte, sql, like, or } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { CreateProductDto, GetProductsQueryDto } from './dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async create(data: typeof products.$inferInsert, tagNames?: string[]) {
    return await this.db.transaction(async (tx) => {
      const result = await tx.insert(products).values(data);
      const productId = result[0].insertId;
      if (tagNames && tagNames.length > 0) {
        await this.associateTagsWithProduct(productId, tagNames, tx);
      }
      return productId;
    });
  }

  async associateTagsWithProduct(productId: number, tagNames: string[], tx?: any) {
    const client = tx || this.db;
    const tagIds = await this.resolveTagIds(tagNames, client);

    // Delete existing associations
    await client.delete(productTags).where(eq(productTags.productId, productId));

    // Insert new associations
    if (tagIds.length > 0) {
      const values = tagIds.map((tagId) => ({
        productId,
        tagId,
      }));
      await client.insert(productTags).values(values);
    }
  }

  async resolveTagIds(tagNames: string[], tx?: any): Promise<number[]> {
    const client = tx || this.db;
    const uniqueTagNames = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
    if (uniqueTagNames.length === 0) return [];

    const tagIds: number[] = [];
    for (const name of uniqueTagNames) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Find or create tag
      let tagId: number;
      const existing = await client
        .select()
        .from(tags)
        .where(or(eq(tags.name, name), eq(tags.slug, slug)))
        .limit(1);

      if (existing.length > 0) {
        tagId = existing[0].id;
      } else {
        const result = await client.insert(tags).values({ name, slug });
        tagId = result[0].insertId;
      }
      tagIds.push(tagId);
    }
    return tagIds;
  }

  async findAll(query: GetProductsQueryDto) {
    const conditions = [];

    if (query.minPrice !== undefined) {
      conditions.push(gte(products.price, String(query.minPrice)));
    }
    if (query.maxPrice !== undefined) {
      conditions.push(lte(products.price, String(query.maxPrice)));
    }

    if (query.query) {
      conditions.push(
        or(
          like(products.name, `%${query.query}%`),
          like(products.description, `%${query.query}%`),
          like(categories.name, `%${query.query}%`),
          sql`exists (
            select 1 from product_tags pt
            inner join tags t on pt.tag_id = t.id
            where pt.product_id = ${products.id} and t.name like ${`%${query.query}%`}
          )`
        )
      );
    }

    if (query.collection) {
      if (query.collection === 'best-sellers') {
        conditions.push(sql`${products.id} IN (101, 102, 105, 106)`);
      } else if (query.collection === 'trending') {
        conditions.push(sql`${products.id} IN (103, 104, 107, 108)`);
      } else if (query.collection === 'new-arrivals') {
        conditions.push(sql`${products.id} IN (109, 110, 111)`);
      } else {
        conditions.push(sql`1 = 0`);
      }
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

    // Filter using subquery for tags
    if (query.tags && query.tags.length > 0) {
      const tagConditions = query.tags.map((tag) => {
        return sql`exists (
          select 1 from product_tags pt
          inner join tags t on pt.tag_id = t.id
          where pt.product_id = ${products.id} and t.name = ${tag}
        )`;
      });
      conditions.push(and(...tagConditions));
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
        tags: sql<any>`(
          SELECT COALESCE(CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug)), ']'), '[]')
          FROM product_tags pt
          INNER JOIN tags t ON pt.tag_id = t.id
          WHERE pt.product_id = products.id
        )`.as('tags'),
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (query.categorySlug) {
      conditions.push(eq(categories.slug, query.categorySlug));
    }

    const results = await baseQuery
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(query.limit)
      .offset(offset);

    return results.map((product) => ({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || []),
    }));
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
        tags: sql<any>`(
          SELECT COALESCE(CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug)), ']'), '[]')
          FROM product_tags pt
          INNER JOIN tags t ON pt.tag_id = t.id
          WHERE pt.product_id = products.id
        )`.as('tags'),
        categoryId: products.categoryId,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    const product = results[0];
    if (product) {
      product.tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || []);
    }
    return product || null;
  }

  async update(id: number, data: Partial<typeof products.$inferInsert>, tagNamesOrTx?: string[] | any, tx?: any) {
    let client = this.db;
    let tagNames: string[] | undefined = undefined;

    if (tagNamesOrTx && !Array.isArray(tagNamesOrTx)) {
      client = tagNamesOrTx;
    } else {
      tagNames = tagNamesOrTx;
      client = tx || this.db;
    }

    const updateData = { ...data };

    if (client === this.db) {
      await this.db.transaction(async (innerTx) => {
        if (Object.keys(updateData).length > 0) {
          await innerTx.update(products).set(updateData).where(eq(products.id, id));
        }
        if (tagNames !== undefined) {
          await this.associateTagsWithProduct(id, tagNames, innerTx);
        }
      });
    } else {
      if (Object.keys(updateData).length > 0) {
        await client.update(products).set(updateData).where(eq(products.id, id));
      }
      if (tagNames !== undefined) {
        await this.associateTagsWithProduct(id, tagNames, client);
      }
    }
  }

  async delete(id: number) {
    await this.db.delete(products).where(eq(products.id, id));
  }

  // Product categories CRUD
  async createCategory(data: typeof categories.$inferInsert) {
    const result = await this.db.insert(categories).values(data);
    return result[0].insertId;
  }

  async findAllCategories() {
    return await this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        productCount: sql<number>`cast(count(${products.id}) as unsigned)`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id)
      .orderBy(categories.name);
  }

  async findCategoryById(id: number) {
    const results = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return results[0] || null;
  }

  async deleteCategory(id: number) {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  // Tags CRUD
  async createTag(data: typeof tags.$inferInsert) {
    const result = await this.db.insert(tags).values(data);
    return result[0].insertId;
  }

  async findAllTags() {
    return await this.db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        productCount: sql<number>`cast(count(${productTags.productId}) as unsigned)`,
      })
      .from(tags)
      .leftJoin(productTags, eq(tags.id, productTags.tagId))
      .groupBy(tags.id)
      .orderBy(tags.name);
  }

  async findTagById(id: number) {
    const results = await this.db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);
    return results[0] || null;
  }

  async findTagByNameOrSlug(name: string, slug: string) {
    const results = await this.db
      .select()
      .from(tags)
      .where(or(eq(tags.name, name), eq(tags.slug, slug)))
      .limit(1);
    return results[0] || null;
  }

  async deleteTag(id: number) {
    await this.db.delete(tags).where(eq(tags.id, id));
  }
}

