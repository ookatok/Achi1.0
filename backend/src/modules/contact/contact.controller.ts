import { Controller, Get, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { CreateContactSchema, CreateContactDto } from './dto/contact.dto';
import { CheckHoneypot } from '../../core/decorators/honeypot.decorator';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @CheckHoneypot({
    fields: ['website'],
    fakeResponse: (req: any) => ({
      success: true,
      id: Math.floor(Math.random() * 10000) + 1,
    }),
  })
  @UsePipes(new ZodValidationPipe(CreateContactSchema))
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.contactService.findAll();
  }
}
