import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import type { CreateProductDto, GetProductsQueryDto, UpdateProductDto, CreateProductCategoryDto, CreateProductTagDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository
  ) {}

  async create(dto: CreateProductDto) {
    const insertId = await this.productRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: String(dto.price),
      stockQuantity: dto.stockQuantity,
      categoryId: dto.categoryId,
      imageUrl: dto.imageUrl,
      images: dto.images as { color?: string; imageUrl: string }[],
      sizes: dto.sizes,
      colors: dto.colors,
    }, dto.tags);
    return { success: true, id: insertId };
  }

  async findAll(query: GetProductsQueryDto) {
    return await this.productRepo.findAll(query);
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
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
    if (dto.images !== undefined) updateFields.images = dto.images as { color?: string; imageUrl: string }[];
    if (dto.sizes !== undefined) updateFields.sizes = dto.sizes;
    if (dto.colors !== undefined) updateFields.colors = dto.colors;
    if (dto.status !== undefined) updateFields.status = dto.status;

    await this.productRepo.update(id, updateFields, dto.tags);
    return { success: true };
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepo.delete(id);
    return { success: true };
  }

  async createCategory(dto: CreateProductCategoryDto) {
    const insertId = await this.productRepo.createCategory({
      name: dto.name,
      slug: dto.slug,
    });
    return { success: true, id: insertId };
  }

  async findAllCategories() {
    return await this.productRepo.findAllCategories();
  }

  async removeCategory(id: number) {
    const category = await this.productRepo.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Product category with ID ${id} not found`);
    }
    await this.productRepo.deleteCategory(id);
    return { success: true };
  }

  // Tag CRUD methods
  async createTag(dto: CreateProductTagDto) {
    const existing = await this.productRepo.findTagByNameOrSlug(dto.name, dto.slug);
    if (existing) {
      return { success: true, id: existing.id };
    }
    const insertId = await this.productRepo.createTag({
      name: dto.name,
      slug: dto.slug,
    });
    return { success: true, id: insertId };
  }

  async findAllTags() {
    return await this.productRepo.findAllTags();
  }

  async removeTag(id: number) {
    const tag = await this.productRepo.findTagById(id);
    if (!tag) {
      throw new NotFoundException(`Product tag with ID ${id} not found`);
    }
    await this.productRepo.deleteTag(id);
    return { success: true };
  }
}

