import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { FaqRepository } from './faq.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService, FaqRepository],
})
export class FaqModule {}
