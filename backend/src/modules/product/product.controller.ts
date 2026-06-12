import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UsePipes, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { CreateProductSchema, GetProductsQuerySchema, CreateProductDto, GetProductsQueryDto, UpdateProductDto, CreateProductCategorySchema, CreateProductCategoryDto, CreateProductTagSchema, CreateProductTagDto } from './dto/product.dto';

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
