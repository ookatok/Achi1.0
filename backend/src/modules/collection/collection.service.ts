import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { collections, collectionProducts } from '../../db/schema/collection.schema';
import { products } from '../../db/schema/product.schema';
import { eq } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { CreateCollectionDto, UpdateCollectionDto } from './dto/collection.dto';

@Injectable()
export class CollectionService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async create(dto: CreateCollectionDto) {
    const { productIds, publishDate, ...collectionData } = dto;
    
    const parsedPublishDate = publishDate ? new Date(publishDate) : null;

    return await this.db.transaction(async (tx) => {
      const result = await tx.insert(collections).values({
        title: dto.title,
        slug: dto.slug,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
        publishDate: parsedPublishDate,
        storyTitleEn: dto.storyTitleEn ?? null,
        storyTitleTh: dto.storyTitleTh ?? null,
        storySubtitleEn: dto.storySubtitleEn ?? null,
        storySubtitleTh: dto.storySubtitleTh ?? null,
        storyParagraphsEn: dto.storyParagraphsEn ?? null,
        storyParagraphsTh: dto.storyParagraphsTh ?? null,
        storyImageUrl: dto.storyImageUrl ?? null,
        galleryImages: dto.galleryImages ?? null,
      });
      const collectionId = result[0].insertId;

      if (productIds && productIds.length > 0) {
        for (const productId of productIds) {
          await tx.insert(collectionProducts).values({
            collectionId,
            productId,
          });
        }
      }

      return collectionId;
    });
  }

  async findAll() {
    // 1. Fetch all collections
    const allCollections = await this.db.select().from(collections);

    // 2. Fetch products for each collection
    const results = [];
    for (const col of allCollections) {
      const associatedProducts = await this.db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          imageUrl: products.imageUrl,
          status: products.status,
        })
        .from(collectionProducts)
        .innerJoin(products, eq(collectionProducts.productId, products.id))
        .where(eq(collectionProducts.collectionId, col.id));

      results.push({
        ...col,
        products: associatedProducts,
      });
    }

    return results;
  }

  async findOne(id: number) {
    const col = await this.db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);

    if (col.length === 0) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    const associatedProducts = await this.db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        imageUrl: products.imageUrl,
        status: products.status,
      })
      .from(collectionProducts)
      .innerJoin(products, eq(collectionProducts.productId, products.id))
      .where(eq(collectionProducts.collectionId, id));

    return {
      ...col[0],
      products: associatedProducts,
    };
  }

  async update(id: number, dto: UpdateCollectionDto) {
    const { productIds, publishDate, ...collectionData } = dto;
    const parsedPublishDate = publishDate !== undefined ? (publishDate ? new Date(publishDate) : null) : undefined;

    // Verify exists
    await this.findOne(id);

    return await this.db.transaction(async (tx) => {
      // Update collection fields
      const updatePayload: any = { ...collectionData };
      if (parsedPublishDate !== undefined) {
        updatePayload.publishDate = parsedPublishDate;
      }
      
      await tx
        .update(collections)
        .set(updatePayload)
        .where(eq(collections.id, id));

      // Update associated products if provided
      if (productIds !== undefined) {
        // Delete existing links
        await tx
          .delete(collectionProducts)
          .where(eq(collectionProducts.collectionId, id));

        // Insert new links
        if (productIds.length > 0) {
          for (const productId of productIds) {
            await tx.insert(collectionProducts).values({
              collectionId: id,
              productId,
            });
          }
        }
      }

      return { success: true };
    });
  }

  async remove(id: number) {
    // Verify exists
    await this.findOne(id);

    await this.db.delete(collections).where(eq(collections.id, id));
    return { success: true };
  }
}
