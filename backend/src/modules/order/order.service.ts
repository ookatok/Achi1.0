import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { OrderRepository } from './order.repository';
import { ProductRepository } from '../product/product.repository';
import { CartService } from '../cart/cart.service';
import type { CheckoutDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database,
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly cartService: CartService
  ) {}

  async checkout(userId: number, dto: CheckoutDto) {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout with an empty cart');
    }

    // Execute the checkout inside a transaction to ensure ACID consistency
    return await this.db.transaction(async (tx) => {
      let totalPrice = 0;

      // 1. Verify and deduct stock for all items
      for (const item of cart.items) {
        // Fetch fresh product stock
        const product = await this.productRepo.findOne(item.productId, tx);

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`Product '${product.name}' is out of stock (Requested: ${item.quantity}, Available: ${product.stockQuantity})`);
        }

        // Deduct stock in DB
        const remainingStock = product.stockQuantity - item.quantity;
        await this.productRepo.update(item.productId, { stockQuantity: remainingStock }, tx);

        // Increment total price
        totalPrice += Number(item.productPrice) * item.quantity;
      }

      // 2. Create Order
      const orderId = await this.orderRepo.createOrder({
        userId,
        totalPrice: String(totalPrice),
        shippingAddress: dto.shippingAddress,
        status: 'pending',
      }, tx);

      // 3. Create Order Items
      for (const item of cart.items) {
        await this.orderRepo.createOrderItem({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
          size: item.size || null,
          color: item.color || null,
        }, tx);
      }

      // 4. Clear the cart
      await this.cartService.clearCart(userId);

      return {
        success: true,
        orderId,
        totalPrice,
      };
    });
  }

  async findAll(userId: number, role: string) {
    if (role === 'admin') {
      return await this.orderRepo.findAllOrdersForAdmin();
    }
    return await this.orderRepo.findAllOrders(userId);
  }

  async findOne(userId: number, orderId: number, role: string) {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (role !== 'admin' && order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    const items = await this.orderRepo.findOrderItemsByOrderId(orderId);

    return {
      ...order,
      items,
    };
  }
}

