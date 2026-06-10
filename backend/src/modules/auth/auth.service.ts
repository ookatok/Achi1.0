import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../core/database/database.provider';
import { users } from '../../db/schema/user.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existingUsers.length > 0) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create user
    await this.db.insert(users).values({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'customer', // Default registered users are customers
    });

    // 4. Fetch the newly created user to return (excluding password)
    const newUsers = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    return newUsers[0];
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const foundUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    const user = foundUsers[0];
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password match
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Sign JWT token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.AUTH_SECRET || 'secret';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;
    
    const accessToken = jwt.sign(payload, secret, { expiresIn });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }
}
