import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { products } from '../../db/schema/product.schema';
import { categories } from '../../db/schema/category.schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { CreateProductDto, GetProductsQueryDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async create(dto: CreateProductDto) {
    const result = await this.db.insert(products).values({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: String(dto.price),
      stockQuantity: dto.stockQuantity,
      categoryId: dto.categoryId,
      imageUrl: dto.imageUrl,
      sizes: dto.sizes,
      colors: dto.colors,
    });
    return { success: true, id: result[0].insertId };
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

  async findOne(id: number) {
    const results = await this.db
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

    if (results.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return results[0];
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateFields: any = {};
    if (dto.name !== undefined) updateFields.name = dto.name;
    if (dto.slug !== undefined) updateFields.slug = dto.slug;
    if (dto.description !== undefined) updateFields.description = dto.description;
    if (dto.price !== undefined) updateFields.price = String(dto.price);
    if (dto.stockQuantity !== undefined) updateFields.stockQuantity = dto.stockQuantity;
    if (dto.categoryId !== undefined) updateFields.categoryId = dto.categoryId;
    if (dto.imageUrl !== undefined) updateFields.imageUrl = dto.imageUrl;
    if (dto.sizes !== undefined) updateFields.sizes = dto.sizes;
    if (dto.colors !== undefined) updateFields.colors = dto.colors;

    await this.db.update(products).set(updateFields).where(eq(products.id, id));
    return { success: true };
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }
}
