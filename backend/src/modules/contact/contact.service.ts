import { Injectable } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import type { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepo: ContactRepository) {}

  async create(dto: CreateContactDto) {
    const id = await this.contactRepo.create(dto);
    return { success: true, id };
  }

  async findAll() {
    return await this.contactRepo.findAll();
  }
}
