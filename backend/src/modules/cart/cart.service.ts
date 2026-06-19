import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { ProductRepository } from '../product/product.repository';
import type { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ErrorCodes } from '../../core/errors/error-codes';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async getOrCreateCart(userId: number) {
    const cart = await this.cartRepo.findCartByUserId(userId);
    if (cart) {
      return cart;
    }
    return await this.cartRepo.createCart(userId);
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.cartRepo.findCartItems(cart.id);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
    };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    // Check if the product exists
    const product = await this.productRepo.findOne(dto.productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    // Check if matching item (product + size + color combo) is already in the cart
    const existingItem = await this.cartRepo.findCartItemCombo(
      cart.id,
      dto.productId,
      dto.size,
      dto.color
    );

    if (existingItem) {
      // Increment quantity
      const newQuantity = existingItem.quantity + dto.quantity;
      await this.cartRepo.updateCartItemQuantity(existingItem.id, newQuantity);
      return { success: true, updated: true };
    }

    // Insert new cart item
    await this.cartRepo.createCartItem({
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
    const item = await this.cartRepo.findCartItemByIdAndCartId(itemId, cart.id);
    if (!item) {
      throw new ForbiddenException({
        message: 'You do not own this cart item',
        code: ErrorCodes.CART_ITEM_NOT_OWNED,
      });
    }

    const updateFields: any = {};
    if (dto.quantity !== undefined) updateFields.quantity = dto.quantity;
    if (dto.size !== undefined) updateFields.size = dto.size;
    if (dto.color !== undefined) updateFields.color = dto.color;

    await this.cartRepo.updateCartItem(itemId, updateFields);
    return { success: true };
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);

    // Verify ownership
    const item = await this.cartRepo.findCartItemByIdAndCartId(itemId, cart.id);
    if (!item) {
      throw new ForbiddenException({
        message: 'You do not own this cart item',
        code: ErrorCodes.CART_ITEM_NOT_OWNED,
      });
    }

    await this.cartRepo.deleteCartItem(itemId);
    return { success: true };
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartRepo.deleteCartItemsByCartId(cart.id);
    return { success: true };
  }
}

