import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes, ParseIntPipe, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { CreateCollectionSchema, CreateCollectionDto, UpdateCollectionDto } from './dto/collection.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(CreateCollectionSchema))
  async create(@Body() dto: CreateCollectionDto) {
    return this.collectionService.create(dto);
  }

  @Get()
  async findAll() {
    return this.collectionService.findAll();
  }

  // File upload for collection cover
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const publicPath = path.join(process.cwd(), 'public');
          const uploadPath = path.join(publicPath, 'assets', 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          callback(null, `collection-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      return { message: 'No file uploaded' };
    }
    const fileUrl = `/assets/uploads/${file.filename}`;
    return { imageUrl: fileUrl };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.collectionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCollectionDto) {
    return this.collectionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.collectionService.remove(id);
  }
}
