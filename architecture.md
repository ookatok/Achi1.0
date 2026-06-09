# Project Architecture: Fashion E-Commerce Website

This document defines the folder structure and architectural design for both the frontend (Astro, React, Tailwind CSS v4, shadcn UI) and the backend (NestJS, Drizzle ORM, MySQL/MariaDB, Auth.js).

---

## 1. Overall Directory Structure

```text
Achi1.0/
├── .agent/                             # AI Agent context and skills
│   └── skill/
│       ├── api-foundation.md
│       ├── clean-architecture.md
│       ├── database-drizzle.md
│       └── security-auth.md
├── backend/                            # NestJS Application
│   ├── src/
│   │   ├── core/                       # Shared modules and infrastructure
│   │   │   ├── database/               # Drizzle connection & provider
│   │   │   ├── filters/                # Exception filters (e.g., HTTP exceptions)
│   │   │   ├── guards/                 # Authentication/RBAC Guards
│   │   │   ├── interceptors/           # Response serialization & formatting
│   │   │   └── pipes/                  # Zod validation validation pipes
│   │   ├── db/                         # Drizzle schema definitions & migrations
│   │   │   ├── schema/                 # Drizzle model tables definitions
│   │   │   └── migrations/             # Drizzle generated SQL files
│   │   ├── modules/                    # Feature/Domain modules (Clean Architecture)
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── order/
│   │   │   ├── payment/
│   │   │   ├── product/
│   │   │   └── user/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── drizzle.config.ts               # Drizzle ORM configuration
│   ├── package.json
│   └── tsconfig.json
├── frontend/                           # Astro & React Application
│   ├── public/                         # Static assets (logos, fallback images)
│   │   └── assets/
│   │       └── images/                 # Public static images (Git-ignored)
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/                 # Astro-optimized design/product images (Git-ignored)
│   │   ├── components/                 # UI components
│   │   │   ├── common/                 # Header, Footer, Layout helpers
│   │   │   ├── features/               # Complex logic blocks (Cart, Product Catalog)
│   │   │   └── ui/                     # shadcn UI components (React)
│   │   ├── layouts/                    # Astro page layouts
│   │   ├── lib/                        # Core utilities & API wrapper
│   │   │   ├── api/
│   │   │   │   ├── client.ts           # Axios / Fetch client
│   │   │   │   └── schema.gen.ts       # Generated OpenAPI types
│   │   │   └── utils.ts                # Tailwind merge/clsx utilities
│   │   ├── pages/                      # Astro page routing
│   │   │   ├── api/                    # Astro API endpoints (e.g., Auth.js handlers)
│   │   │   ├── auth/                   # Sign in, registration
│   │   │   ├── products/               # Product details and listings
│   │   │   └── index.astro             # Home page
│   │   └── styles/
│   │       └── global.css              # Tailwind CSS v4 styling rules
│   ├── astro.config.mjs                # Astro config
│   ├── package.json
│   ├── tailwind.config.js              # (Optional/v4 CSS imports config)
│   └── tsconfig.json
├── .gitignore                          # Excludes node_modules and images from Git
├── architecture.md                     # This architectural blueprint
└── plan.md                             # Phase-by-phase project execution plan
```

---

## 2. Frontend Architecture (Astro + React + Tailwind v4)

We utilize the **Astro Islands** (Component Islands) model:
*   **Static Rendering (Default)**: Landing pages, product directories, and static content are rendered to HTML at build time or server-rendered (SSR) without JavaScript.
*   **Interactive React Components (Islands)**: Interactive elements such as the shopping cart drawer, search autocomplete bar, and checkout form are built in React and hydrated in the browser (e.g., `<CartButton client:load />`).
*   **Tailwind CSS v4**: Built natively with `@tailwindcss/vite` within Astro's bundler, using CSS variables rather than custom configuration JS files.
*   **shadcn UI**: Selected React UI components are placed in `frontend/src/components/ui/` and styled with Tailwind.
*   **Assets & Image Optimization**: Local mock product photos or design graphics should be placed in `frontend/src/assets/images/` or `frontend/public/assets/images/`. In accordance with E-Commerce guidelines, actual content/product image binary uploads are excluded from git checkins (ignored via the root [`.gitignore`](file:///c:/Users/VICTUS/Desktop/Achi1.0/.gitignore)) to keep repositories lean. Use CDN or external URLs for real storage production environments.

---

## 3. Backend Architecture (NestJS + Drizzle + MySQL)

The backend follows a **Modular Clean Architecture**:
*   **Domain Decoupling**: Each module under `modules/` encapsulates a specific business domain (e.g., `product/` or `order/`).
*   **Data Flow**:
    1.  **Request (HTTP)** -> Handled by Controller (`*.controller.ts`). Inputs validated using **Zod schemas**.
    2.  **Logic (Service)** -> Business rules processed in Service (`*.service.ts`).
    3.  **Data Access (Drizzle)** -> Handled via injected Drizzle database providers. Transactions are managed at the service level.
*   **Drizzle ORM & MySQL**: Schemas are declared in `db/schema/` and imported collectively. Drizzle runs database operations against MariaDB/MySQL.

---

## 4. Cross-Cutting Integration Flow

```mermaid
graph TD
    subgraph Frontend (Astro/React)
        A[Astro Pages / SSR] --> B[React Islands]
        B --> C[API Client / schema.gen.ts]
    end

    subgraph API Generation
        D[NestJS OpenAPI Spec] -- "openapi-typescript" --> C
    end

    subgraph Backend (NestJS)
        E[NestJS Controllers] --> F[NestJS Services]
        F --> G[Drizzle ORM]
        G --> H[(MySQL/MariaDB)]
    end

    C -- "HTTP Request (with JWT)" --> E
```

1.  **Authentication**: Astro intercepts auth requests using **Auth.js (Next Auth v5)**. Auth.js mints a JWT session. The JWT token is forwarded in the `Authorization: Bearer <token>` header to NestJS.
2.  **API Schema Codegen**: The backend serves an OpenAPI specification endpoint at `/docs-json`. The frontend runs `npm run gen:api` to automatically generate type definitions in `schema.gen.ts` to keep the API layer strongly typed.
3.  **Request Validation**: NestJS verifies incoming requests using Zod schemas matching the OpenAPI definitions.
