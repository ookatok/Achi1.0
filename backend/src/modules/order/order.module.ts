import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { OrderRepository } from './order.repository';

@Module({
  imports: [CartModule, ProductModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}

