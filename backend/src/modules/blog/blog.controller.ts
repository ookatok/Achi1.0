import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes, ParseIntPipe, HttpCode, HttpStatus, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { CreateBlogSchema, CreateBlogDto, UpdateBlogDto, CreateBlogCategorySchema, CreateBlogCategoryDto } from './dto/blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Blog posts CRUD
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(CreateBlogSchema))
  async create(@Body() dto: CreateBlogDto, @Req() req: any) {
    const authorId = req.user.id;
    return this.blogService.create(dto, authorId);
  }

  @Get()
  async findAll() {
    return this.blogService.findAll();
  }

  // Categories CRUD (Defined before parameter routes to prevent clashes)
  @Get('categories')
  async findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(CreateBlogCategorySchema))
  async createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.removeCategory(id);
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
          callback(null, `blog-${uniqueSuffix}${ext}`);
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
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}
