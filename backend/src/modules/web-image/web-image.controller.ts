import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WebImageService } from './web-image.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@Controller('web-image')
export class WebImageController {
  constructor(private readonly webImageService: WebImageService) {}

  @Get('convert-all')
  async convertAll() {
    return this.webImageService.convertAll();
  }

  @Get('settings')
  async getSettings() {
    return this.webImageService.getSettings();
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateSetting(@Body() body: { key: string; value: string }) {
    return this.webImageService.updateSetting(body.key, body.value);
  }
}
