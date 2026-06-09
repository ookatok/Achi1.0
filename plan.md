# Project Execution Plan: Fashion E-Commerce Website

This plan details the steps required to build the fashion e-commerce website from scratch using our chosen stack.

---

## Phase 1: Workspace Setup & Infrastructure
*   **Step 1.1**: Initialize monorepo structure. Create `frontend/` and `backend/` directories.
*   **Step 1.2**: Initialize NestJS backend. Add TypeScript, NestJS CLI configs, and essential backend dependencies.
*   **Step 1.3**: Initialize Astro frontend. Configure Astro with React framework integrations and tailwind CSS v4.
*   **Step 1.4**: Configure `.agent/skill/` guidelines to train AI assistants on coding conventions.

## Phase 2: Database Schema & Migration Setup
*   **Step 2.1**: Set up MariaDB/MySQL database docker container or connection pool in backend.
*   **Step 2.2**: Write Drizzle schema definitions (`backend/src/db/schema/`):
    *   `users`: ID, name, email, password (hashed), role (admin/customer), timestamps.
    *   `products`: ID, name, description, price, stock_quantity, images, size, color, timestamps.
    *   `categories`: ID, name, parent_category_id.
    *   `carts` & `cart_items`: Cart persistence linked to user session or anonymous session.
    *   `orders` & `order_items`: Checkout logs containing shipping details, billing status.
*   **Step 2.3**: Configure Drizzle kit, generate database migration SQLs, and execute them.

## Phase 3: Authentication & Security Flow
*   **Step 3.1**: Build backend sign-up/sign-in JWT verification pipes.
*   **Step 3.2**: Configure **Auth.js** (Next Auth v5) inside Astro frontend. Set up the Astro Middleware to intercept sessions.
*   **Step 3.3**: Configure NestJS JwtAuthGuard to verify signed JWTs coming from the frontend Auth.js handler.
*   **Step 3.4**: Setup Role-Based Access Control (RBAC) in NestJS (e.g., `@Roles(Role.Admin)` decorator).

## Phase 4: API & OpenAPI Contract Codegen
*   **Step 4.1**: Install Swagger inside NestJS and configure main.ts to expose the JSON document endpoint `/docs-json`.
*   **Step 4.2**: Set up frontend package.json script:
    ```json
    "gen:api": "openapi-typescript http://localhost:3001/docs-json -o src/lib/api/schema.gen.ts"
    ```
*   **Step 4.3**: Implement the typed fetch client in `frontend/src/lib/api/client.ts`.

## Phase 5: Core Features Implementation
*   **Step 5.1: Product & Catalog**:
    *   Backend GET endpoints for listing products with filtering (price, category, size, color) and pagination.
    *   Astro static/SSR catalog page. React interactive filtering components.
*   **Step 5.2: Cart & Wishlist**:
    *   Backend endpoints for adding, updating, removing cart items.
    *   React cart sidebar/drawer using shadcn UI components.
*   **Step 5.3: Checkout & Order Placement**:
    *   Transactional backend ordering process (Checking stock, creating orders, updating stock inside a Drizzle Transaction).
    *   Payment page simulation linking to checkout success pages.

## Phase 6: Styling & Polish
*   **Step 6.1**: Incorporate Tailwind CSS v4 variables and custom themes for fashion branding (chic colors, sleek fonts like *Outfit* or *Playfair Display*).
*   **Step 6.2**: Design fluid micro-animations (e.g., hover effects on clothing cards, slide-in cart drawers).
*   **Step 6.3**: Optimize image loading via Astro Image compression component or Cloudinary CDN integration rules.

## Phase 7: Verification & Testing
*   **Step 7.1**: Write NestJS unit tests for core payment/order services.
*   **Step 7.2**: Run OpenAPI checks to verify code-generation works smoothly on endpoint changes.
