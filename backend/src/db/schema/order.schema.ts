import { mysqlTable, bigint, varchar, decimal, int, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { users } from './user.schema';
import { products } from './product.schema';

export const orders = mysqlTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: mysqlEnum('status', ['pending', 'paid', 'shipped', 'cancelled', 'refunded']).notNull().default('pending'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: varchar('shipping_address', { length: 500 }).notNull(),
  isPreOrder: boolean('is_pre_order').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable('order_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'set null' }),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // capture checkout price
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
