import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UsePipes, ParseIntPipe, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { CreateProductSchema, GetProductsQuerySchema, CreateProductDto, GetProductsQueryDto, UpdateProductDto, CreateProductCategorySchema, CreateProductCategoryDto, CreateProductTagSchema, CreateProductTagDto } from './dto/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(GetProductsQuerySchema))
  async findAll(@Query() query: GetProductsQueryDto) {
    return this.productService.findAll(query);
  }

  // Product Category Endpoints
  @Get('categories')
  async findAllCategories() {
    return this.productService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(CreateProductCategorySchema))
  async createCategory(@Body() dto: CreateProductCategoryDto) {
    return this.productService.createCategory(dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.productService.removeCategory(id);
  }

  // Product Tag Endpoints
  @Get('tags')
  async findAllTags() {
    return this.productService.findAllTags();
  }

  @Post('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(CreateProductTagSchema))
  async createTag(@Body() dto: CreateProductTagDto) {
    return this.productService.createTag(dto);
  }

  @Delete('tags/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeTag(@Param('id', ParseIntPipe) id: number) {
    return this.productService.removeTag(id);
  }

  // File upload
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
          callback(null, `product-${uniqueSuffix}${ext}`);
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
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
