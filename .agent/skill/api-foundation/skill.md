# AI Skill: API Foundation & Codegen (NestJS to Astro)

This guideline defines the contracts, formatting, and client-side code-generation patterns for communication between the NestJS backend and Astro frontend.

---

## 1. Backend OpenAPI Swagger Setup

NestJS must automatically generate and expose the API documentation. We use `@nestjs/swagger` to export an OpenAPI JSON schema.

### Exposing the Endpoint
Configure the Swagger module in `backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Fashion E-Commerce API')
    .setDescription('The core API documentation for the fashion catalog and payments')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Expose JSON format for code-gen
  app.use('/docs-json', (req, res) => res.json(document));
  
  // Expose interactive Swagger UI
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001);
}
bootstrap();
```

---

## 2. Code-Gen to Frontend Schema

The frontend automatically tracks and consumes backend endpoint signatures by pulling the JSON specification.

### Codegen CLI script
In `frontend/package.json`, install `openapi-typescript` and add the following command:
```json
{
  "scripts": {
    "gen:api": "openapi-typescript http://localhost:3001/docs-json -o src/lib/api/schema.gen.ts"
  }
}
```

### Consumption Helper (`frontend/src/lib/api/client.ts`)
We use `openapi-fetch` or a typed fetch client wrapper that enforces backend types:
```typescript
import createClient from "openapi-fetch";
import type { paths } from "./schema.gen";

// Create client using generated routes
export const api = createClient<paths>({ 
  baseUrl: import.meta.env.PUBLIC_API_URL || "http://localhost:3001" 
});

// Example fetch product list:
// const { data, error } = await api.GET("/products", {
//   params: { query: { categoryId: 1 } }
// });
```

---

## 3. Zod & Request Validation

To ensure robust data sanitization:
*   Use Zod schemas for internal request structures.
*   In NestJS, utilize `nestjs-zod` or write custom ValidationPipes utilizing Zod to map requests to clean DTOs before controller activation.
*   Zod validation errors must throw structured standard HTTP errors (e.g. status code 400 with a detailed error array).

### Example NestJS Zod validation pipe
```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}
```

---

## 4. Standard Response Envelope

All API endpoints must follow a consistent JSON response signature:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```
Or for errors:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Required fields are missing",
    "details": [...]
  }
}
```
Ensure interceptors in NestJS (under `backend/src/core/interceptors/`) wrap outgoing payloads in this envelope.
