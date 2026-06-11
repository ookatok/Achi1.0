import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import type { CreateBlogDto, UpdateBlogDto, CreateBlogCategoryDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepo: BlogRepository) {}

  // Blog Posts
  async create(dto: CreateBlogDto, authorId: number) {
    const insertId = await this.blogRepo.create({
      title: dto.title,
      slug: dto.slug,
      summary: dto.summary || '',
      content: dto.content,
      imageUrl: dto.imageUrl || '',
      authorId,
      categoryId: dto.categoryId || null,
    });
    return { success: true, id: insertId };
  }

  async findAll() {
    return await this.blogRepo.findAll();
  }

  async findOne(id: number) {
    const blog = await this.blogRepo.findOne(id);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return blog;
  }

  async update(id: number, dto: UpdateBlogDto) {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    const updateFields: any = {};
    if (dto.title !== undefined) updateFields.title = dto.title;
    if (dto.slug !== undefined) updateFields.slug = dto.slug;
    if (dto.summary !== undefined) updateFields.summary = dto.summary;
    if (dto.content !== undefined) updateFields.content = dto.content;
    if (dto.imageUrl !== undefined) updateFields.imageUrl = dto.imageUrl;
    if (dto.categoryId !== undefined) updateFields.categoryId = dto.categoryId || null;

    await this.blogRepo.update(id, updateFields);
    return { success: true };
  }

  async remove(id: number) {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    await this.blogRepo.delete(id);
    return { success: true };
  }

  // Blog Categories
  async createCategory(dto: CreateBlogCategoryDto) {
    const insertId = await this.blogRepo.createCategory({
      name: dto.name,
      slug: dto.slug,
    });
    return { success: true, id: insertId };
  }

  async findAllCategories() {
    return await this.blogRepo.findAllCategories();
  }

  async removeCategory(id: number) {
    const category = await this.blogRepo.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Blog category with ID ${id} not found`);
    }
    await this.blogRepo.deleteCategory(id);
    return { success: true };
  }
}
