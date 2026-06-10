import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, UsePipes, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { AddToCartSchema, UpdateCartItemSchema, AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(AddToCartSchema))
  async addItem(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user.id;
    return this.cartService.addItem(userId, dto);
  }

  @Patch('item/:id')
  async updateItem(
    @Req() req: any,
    @Param('id', ParseIntPipe) itemId: number,
    @Body(new ZodValidationPipe(UpdateCartItemSchema)) dto: UpdateCartItemDto
  ) {
    const userId = req.user.id;
    return this.cartService.updateItem(userId, itemId, dto);
  }

  @Delete('item/:id')
  @HttpCode(HttpStatus.OK)
  async removeItem(@Req() req: any, @Param('id', ParseIntPipe) itemId: number) {
    const userId = req.user.id;
    return this.cartService.removeItem(userId, itemId);
  }
}
