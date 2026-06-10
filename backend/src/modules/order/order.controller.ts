import { Controller, Get, Post, Body, Param, Req, UseGuards, UsePipes, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { CheckoutSchema, CheckoutDto } from './dto/order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CheckoutSchema))
  async checkout(@Req() req: any, @Body() dto: CheckoutDto) {
    const userId = req.user.id;
    return this.orderService.checkout(userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.orderService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) orderId: number) {
    const userId = req.user.id;
    return this.orderService.findOne(userId, orderId);
  }
}
