# AI Skill: Drizzle ORM & Database Conventions (MySQL/MariaDB)

This guide defines schema configuration, database migrations, connection pooling, and transaction patterns when using **Drizzle ORM** with MySQL or MariaDB in the NestJS application.

---

## 1. Schema Definitions & Conventions

Define all schemas under `backend/src/db/schema/` using table file basenames (e.g. `user.schema.ts`, `product.schema.ts`). Export all files from `backend/src/db/schema/index.ts` so they are parsed together by Drizzle Kit.

### Naming Conventions
*   **Table Names**: Snake-case plural (e.g., `products`, `order_items`).
*   **Column Names**: Camel-case for TS fields, auto-mapped to snake_case in SQL where applicable.
*   **Primary Keys**: auto-incrementing integer or nanoid (varchar).

### Sample Schema (`backend/src/db/schema/product.schema.ts`)
```typescript
import { mysqlTable, bigint, varchar, decimal, int, timestamp } from 'drizzle-orm/mysql-core';

export const products = mysqlTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int('stock_quantity').notNull().default(0),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
```

---

## 2. Database Connection Pool Setup

We configure a persistent connection pool using `mysql2` to prevent socket leaks and provide efficient concurrent querying.

### NestJS Drizzle Module (`backend/src/core/database/`)

#### 1. Provider config (`database.provider.ts`)
```typescript
import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from '../../db/schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

export const DatabaseProvider: Provider = {
  provide: DRIZZLE_PROVIDER,
  useFactory: async () => {
    const connection = await mysql.createPool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'fashion_db',
      connectionLimit: 10,
    });
    return drizzle(connection, { schema, mode: 'default' });
  },
};
```

---

## 3. Transaction Management in Services

To guarantee ACID consistency (highly critical for orders and payments), database transactions are managed in NestJS services using Drizzle’s transaction mechanism.

### How to use Transactions in NestJS Services
Wrap mutations inside `.transaction()` and forward the transaction instance (`tx`) to repositories.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { ProductRepository } from '../product/product.repository';
import { OrderRepository } from './order.repository';

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database,
    private readonly productRepo: ProductRepository,
    private readonly orderRepo: OrderRepository,
  ) {}

  async processCheckout(userId: number, items: { productId: number; quantity: number }[]) {
    // Execute multiple operations transactionally
    return await this.db.transaction(async (tx) => {
      
      // 1. Verify and deduct stock (forward 'tx' to use transaction context)
      for (const item of items) {
        const product = await this.productRepo.findById(item.productId);
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Out of stock: ${product.name}`);
        }
        await this.productRepo.updateStock(item.productId, product.stockQuantity - item.quantity, tx);
      }

      // 2. Create the Order
      const newOrder = await this.orderRepo.createOrder({ userId, status: 'pending' }, tx);
      return newOrder;
    });
  }
}
```

---

## 4. Database Migrations Workflow

Migrations are managed outside the runtime using `drizzle-kit`.

### Config File (`backend/drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'fashion_db',
    port: Number(process.env.DATABASE_PORT) || 3306,
  },
});
```

### Migration Lifecycle CLI commands
*   **Generate SQL schema diffs**: `npx drizzle-kit generate`
*   **Run migrations onto database**: `npx drizzle-kit migrate`
*   **Open interactive database schema studio**: `npx drizzle-kit studio`
