import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactService, ContactRepository],
})
export class ContactModule {}
