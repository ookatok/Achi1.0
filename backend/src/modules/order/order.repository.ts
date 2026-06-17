import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { orders, orderItems } from '../../db/schema/order.schema';
import { products } from '../../db/schema/product.schema';
import { eq } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class OrderRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async createOrder(data: typeof orders.$inferInsert, tx?: any) {
    const client = tx || this.db;
    const result = await client.insert(orders).values(data);
    return result[0].insertId;
  }

  async createOrderItem(data: typeof orderItems.$inferInsert, tx?: any) {
    const client = tx || this.db;
    await client.insert(orderItems).values(data);
  }

  async findAllOrders(userId: number) {
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

  async findAllOrdersForAdmin() {
    return await this.db
      .select({
        id: orders.id,
        status: orders.status,
        totalPrice: orders.totalPrice,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
      })
      .from(orders);
  }

  async findOrderById(orderId: number) {
    const results = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    return results[0] || null;
  }

  async findOrderItemsByOrderId(orderId: number) {
    return await this.db
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
  }
}
