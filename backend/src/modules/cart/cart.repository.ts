import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { carts, cartItems } from '../../db/schema/cart.schema';
import { products } from '../../db/schema/product.schema';
import { eq, and, sql } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class CartRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async findCartByUserId(userId: number) {
    const results = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);
    return results[0] || null;
  }

  async createCart(userId: number) {
    const result = await this.db.insert(carts).values({ userId });
    return { id: result[0].insertId, userId };
  }

  async findCartItems(cartId: number) {
    return await this.db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        size: cartItems.size,
        color: cartItems.color,
        productName: products.name,
        productPrice: products.price,
        activeDiscountPercent: sql<number>`greatest(coalesce(${products.discountPercent}, 0), coalesce((select max(c.discount_percent) from collection_products cp inner join collections c on cp.collection_id = c.id where cp.product_id = products.id), 0))`.as('active_discount_percent'),
        productImageUrl: products.imageUrl,
        stockQuantity: products.stockQuantity,
        allowOnOrder: products.allowOnOrder,
        onOrderQuantity: products.onOrderQuantity,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));
  }

  async findCartItemCombo(
    cartId: number,
    productId: number,
    size: string | null | undefined,
    color: string | null | undefined
  ) {
    const conditions = [
      eq(cartItems.cartId, cartId),
      eq(cartItems.productId, productId),
    ];
    if (size) conditions.push(eq(cartItems.size, size));
    if (color) conditions.push(eq(cartItems.color, color));

    const results = await this.db
      .select()
      .from(cartItems)
      .where(and(...conditions))
      .limit(1);
    return results[0] || null;
  }

  async updateCartItemQuantity(itemId: number, quantity: number) {
    await this.db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId));
  }

  async createCartItem(data: typeof cartItems.$inferInsert) {
    await this.db.insert(cartItems).values(data);
  }

  async findCartItemByIdAndCartId(itemId: number, cartId: number) {
    const results = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .limit(1);
    return results[0] || null;
  }

  async updateCartItem(itemId: number, data: Partial<typeof cartItems.$inferInsert>) {
    await this.db.update(cartItems).set(data).where(eq(cartItems.id, itemId));
  }

  async deleteCartItem(itemId: number) {
    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async deleteCartItemsByCartId(cartId: number) {
    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
}
