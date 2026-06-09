# AI Skill: Clean Architecture Guidelines (NestJS)

This guideline defines the design patterns for building decoupled, testable, and maintainable services within the NestJS backend.

---

## 1. Core Principles

The project follows clean architecture boundaries:
1.  **Independent of Database**: Business rules (Services) should not be heavily dependent on database ORM quirks. Data querying is abstracted.
2.  **Independent of UI/API protocols**: Controllers act as thin entry boundaries translating incoming requests (HTTP, Websocket) into domain actions.
3.  **Strict Layer Flow**: Data always flows inward from controllers to services, and service layers query repositories or abstract persistence models.

---

## 2. Decoupled Architecture Layers

```text
Incoming HTTP Request
      │
      ▼
┌──────────────┐      Validates input types (using Zod)
│  Controller  │ ────► Triggers application services
└──────────────┘
      │
      ▼
┌──────────────┐      Maintains core domain rules
│   Service    │ ────► Coordinates multi-step transaction limits
└──────────────┘
      │
      ▼
┌──────────────┐      Abstracts Drizzle schema and queries
│  Repository  │ ────► Connects to database client
└──────────────┘
```

### Layer 1: Presentation (Controllers)
*   **Role**: Define HTTP endpoints, HTTP verbs, routes, and response statuses.
*   **Rules**:
    *   No complex business logic.
    *   Validate input shapes immediately using Zod.
    *   Inject Services to invoke operations.

### Layer 2: Application Logic (Services)
*   **Role**: Execute business workflow rules.
*   **Rules**:
    *   Manage database transactions when multiple tables must be modified together (e.g. reserving inventory + creating an order).
    *   Use Domain Models (TS Interfaces) instead of passing raw database schemas around.

### Layer 3: Data Access (Drizzle Repositories)
*   **Role**: Map MySQL tables to memory structures and coordinate database reads/writes.
*   **Rules**:
    *   Keep ORM queries restricted to files under `repositories/` or encapsulate database calls into explicit provider classes.

---

## 3. Reference Implementation: Product Module Example

### 1. Repository Boundary (`product.repository.ts`)
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { products } from '../../db/schema/product.schema';
import { eq } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async findById(id: number) {
    const results = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return results[0] || null;
  }

  async updateStock(id: number, newStock: number, transactionContext?: any) {
    const database = transactionContext || this.db;
    await database
      .update(products)
      .set({ stockQuantity: newStock })
      .where(eq(products.id, id));
  }
}
```

### 2. Service Implementation (`product.service.ts`)
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async verifyAndDeductStock(productId: number, quantity: number, trx?: any) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.stockQuantity < quantity) {
      throw new Error(`Insufficient inventory for product: ${product.name}`);
    }

    const remainingStock = product.stockQuantity - quantity;
    await this.productRepo.updateStock(productId, remainingStock, trx);
    return true;
  }
}
```

### 3. Controller Implementation (`product.controller.ts`)
```typescript
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id/verify')
  async verifyProduct(@Param('id', ParseIntPipe) id: number) {
    // Controller validates basic param, service does business check
    return { success: true };
  }
}
```
---

## 4. Module Rules
*   Never use relative imports across module directories (e.g., do not write `import { UserService } from '../user/user.service'`). Use NestJS DI injection by exporting user services in `UserModule` and importing `UserModule` inside `ProductModule`.
*   Avoid circular imports. If Module A needs Module B and B needs A, move shared components to a Common/Core module or use NestJS `forwardRef()`.
