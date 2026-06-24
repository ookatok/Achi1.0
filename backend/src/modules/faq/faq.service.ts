import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqRepository } from './faq.repository';
import type { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly faqRepo: FaqRepository) {}

  async create(dto: CreateFaqDto) {
    const id = await this.faqRepo.create(dto as any);
    return { success: true, id };
  }

  async findAll() {
    return await this.faqRepo.findAll();
  }

  async findOne(id: number) {
    const faq = await this.faqRepo.findOne(id);
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: number, dto: UpdateFaqDto) {
    await this.findOne(id); // Throws if not found
    await this.faqRepo.update(id, dto as any);
    return { success: true };
  }

  async delete(id: number) {
    await this.findOne(id); // Throws if not found
    await this.faqRepo.delete(id);
    return { success: true };
  }
}
