import { Controller, Get, UseGuards } from '@nestjs/common';
import { WebImageService } from './web-image.service';

@Controller('web-image')
export class WebImageController {
  constructor(private readonly webImageService: WebImageService) {}

  @Get('convert-all')
  async convertAll() {
    return this.webImageService.convertAll();
  }
}
