import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { orders, orderItems } from '../../db/schema/order.schema';
import { products } from '../../db/schema/product.schema';
import { CartService } from '../cart/cart.service';
import { eq, and } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { CheckoutDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database,
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
        const productList = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        const product = productList[0];
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`Product '${product.name}' is out of stock (Requested: ${item.quantity}, Available: ${product.stockQuantity})`);
        }

        // Deduct stock in DB
        const remainingStock = product.stockQuantity - item.quantity;
        await tx
          .update(products)
          .set({ stockQuantity: remainingStock })
          .where(eq(products.id, item.productId));

        // Increment total price
        totalPrice += Number(item.productPrice) * item.quantity;
      }

      // 2. Create Order
      const orderResult = await tx.insert(orders).values({
        userId,
        totalPrice: String(totalPrice),
        shippingAddress: dto.shippingAddress,
        status: 'pending',
      });

      const orderId = orderResult[0].insertId;

      // 3. Create Order Items
      for (const item of cart.items) {
        await tx.insert(orderItems).values({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
          size: item.size || null,
          color: item.color || null,
        });
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

  async findAll(userId: number) {
    return await this.db
      .select({
        id: orders.id,
        status: orders.status,
        totalPrice: orders.totalPrice,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId));
  }

  async findOne(userId: number, orderId: number) {
    const orderList = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderList[0];
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    const items = await this.db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: orderItems.size,
        color: orderItems.color,
        productName: products.name,
        productImageUrl: products.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      items,
    };
  }
}
