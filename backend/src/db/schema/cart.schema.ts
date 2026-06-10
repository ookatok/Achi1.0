import { mysqlTable, bigint, int, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';
import { products } from './product.schema';

export const carts = mysqlTable('carts', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable('cart_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  cartId: bigint('cart_id', { mode: 'number' }).references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: int('quantity').notNull().default(1),
  size: varchar('size', { length: 50 }),   // size of the clothing item, e.g. "M"
  color: varchar('color', { length: 50 }), // color of the clothing item, e.g. "Red"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
