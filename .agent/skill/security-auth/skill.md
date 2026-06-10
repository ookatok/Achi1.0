# AI Skill: Security & Authentication (Auth.js + JWT + NestJS)

This guide details authentication implementation, token lifecycle, security validation, and Role-Based Access Control (RBAC).

---

## 1. Authentication Flow Architecture

```text
┌──────────────────┐           Authenticates          ┌───────────────────┐
│  Astro Frontend  │ ───────────────────────────────► │  Auth.js Server   │
│  (React Islands) │ ◄─────────────────────────────── │ (Signs JWT Token) │
└──────────────────┘          Returns Session JWT     └───────────────────┘
         │
         │ (Headers: Authorization: Bearer <JWT>)
         ▼
┌──────────────────┐           Verifies Token         ┌───────────────────┐
│  NestJS Backend  │ ───────────────────────────────► │  Local Decryption │
│   (Controllers)  │ ◄─────────────────────────────── │  (Extracts User)  │
└──────────────────┘          Accepts / Denies        └───────────────────┘
```

1.  **Sign-in Interface**: Astro handles sign-in through `Auth.js` (Auth.js Astro adapter).
2.  **JWT Signing**: Auth.js generates a secure JWT token containing the user profile, role, and claims, encrypted/signed with `AUTH_SECRET`.
3.  **Forwarding JWT**: The frontend intercepts backend calls and attaches the JWT session token to request headers.
4.  **JWT Verification**: NestJS intercepts request packets, validates JWT signature using the same shared secret (`AUTH_SECRET`), and checks user permissions.

---

## 2. Frontend Auth.js Setup (Astro)

Initialize Auth.js handler configuration under `frontend/src/pages/api/auth/[...auth].ts`.

```typescript
import AstroAuth from "auth-astro";
import Credentials from "@auth/core/providers/credentials";

export const { GET, POST } = AstroAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Authenticate with NestJS back-channel
        const res = await fetch("http://localhost:3001/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });
        
        const user = await res.json();
        if (res.ok && user) {
          return user; // { id, name, email, role, accessToken }
        }
        return null;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      (session as any).accessToken = token.accessToken;
      (session as any).user.role = token.role;
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
});
```

---

## 3. NestJS JWT Guard & Verification

NestJS extracts the Bearer token and decodes/verifies it.

### Auth Guard implementation (`backend/src/core/guards/jwt-auth.guard.ts`)
```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authHeader.split(' ')[1];
    try {
      // Decode and check signature using shared auth secret
      const decoded = jwt.verify(token, process.env.AUTH_SECRET || 'secret');
      request.user = decoded; // Attach user metadata to request
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token signature validation failed');
    }
  }
}
```

---

## 4. Role-Based Access Control (RBAC)

Use custom metadata decorators to define authorization rules for admin routes.

### 1. Roles Decorator (`backend/src/core/decorators/roles.decorator.ts`)
```typescript
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### 2. Roles Guard (`backend/src/core/guards/roles.guard.ts`)
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true; // Route is public role-wise

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return true;
  }
}
```

### 3. Guard usage in Controller
```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductController {
  
  @Post()
  @Roles('admin') // Only users with 'admin' role can create items
  async createProduct(@Body() body: any) {
    return { success: true };
  }
}
```
---

## 5. General Security Guidelines & Bcrypt Implementation

### Password Hashing (Bcrypt)
All user passwords must be hashed before persistence using the `bcrypt` library. Never store plain text passwords.

#### Implementation Example
```typescript
import * as bcrypt from 'bcrypt';

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hashes a plaintext password.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compares a plaintext password with a hashed password.
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### Secret Management
*   Never commit `AUTH_SECRET`, database passwords, or private keys to version control.
*   Store secrets in a `.env` file at the root/package directories and list `.env` in the project `.gitignore`.
