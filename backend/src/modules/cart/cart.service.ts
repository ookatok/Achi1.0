import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { carts, cartItems } from '../../db/schema/cart.schema';
import { products } from '../../db/schema/product.schema';
import { eq, and } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async getOrCreateCart(userId: number) {
    const existingCarts = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (existingCarts.length > 0) {
      return existingCarts[0];
    }

    const result = await this.db.insert(carts).values({ userId });
    return { id: result[0].insertId, userId };
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    const items = await this.db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        size: cartItems.size,
        color: cartItems.color,
        productName: products.name,
        productPrice: products.price,
        productImageUrl: products.imageUrl,
        stockQuantity: products.stockQuantity,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    return {
      id: cart.id,
      userId: cart.userId,
      items,
    };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    // Check if the product exists
    const productList = await this.db.select().from(products).where(eq(products.id, dto.productId)).limit(1);
    if (productList.length === 0) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    // Check if matching item (product + size + color combo) is already in the cart
    const conditions = [
      eq(cartItems.cartId, cart.id),
      eq(cartItems.productId, dto.productId),
    ];
    if (dto.size) conditions.push(eq(cartItems.size, dto.size));
    if (dto.color) conditions.push(eq(cartItems.color, dto.color));

    const existingItems = await this.db
      .select()
      .from(cartItems)
      .where(and(...conditions))
      .limit(1);

    if (existingItems.length > 0) {
      // Increment quantity
      const newQuantity = existingItems[0].quantity + dto.quantity;
      await this.db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItems[0].id));
      return { success: true, updated: true };
    }

    // Insert new cart item
    await this.db.insert(cartItems).values({
      cartId: cart.id,
      productId: dto.productId,
      quantity: dto.quantity,
      size: dto.size || null,
      color: dto.color || null,
    });

    return { success: true, updated: false };
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    // Verify ownership of the cart item
    const item = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);

    if (item.length === 0) {
      throw new ForbiddenException('You do not own this cart item');
    }

    const updateFields: any = {};
    if (dto.quantity !== undefined) updateFields.quantity = dto.quantity;
    if (dto.size !== undefined) updateFields.size = dto.size;
    if (dto.color !== undefined) updateFields.color = dto.color;

    await this.db.update(cartItems).set(updateFields).where(eq(cartItems.id, itemId));
    return { success: true };
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);

    // Verify ownership
    const item = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);

    if (item.length === 0) {
      throw new ForbiddenException('You do not own this cart item');
    }

    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));
    return { success: true };
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    await this.db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return { success: true };
  }
}
