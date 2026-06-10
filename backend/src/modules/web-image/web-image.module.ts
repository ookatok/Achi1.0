import { Module } from '@nestjs/common';
import { WebImageService } from './web-image.service';
import { WebImageController } from './web-image.controller';

@Module({
  controllers: [WebImageController],
  providers: [WebImageService],
  exports: [WebImageService],
})
export class WebImageModule {}
