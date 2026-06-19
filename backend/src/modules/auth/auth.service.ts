import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { RegisterDto, LoginDto } from './dto/auth.dto';
import { ErrorCodes } from '../../core/errors/error-codes';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.userRepo.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException({
        message: 'Email already registered',
        code: ErrorCodes.EMAIL_ALREADY_REGISTERED,
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create user
    await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'customer', // Default registered users are customers
    });

    // 4. Fetch the newly created user to return (excluding password)
    const newUser = await this.userRepo.findByEmail(dto.email);
    if (!newUser) return null;

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        code: ErrorCodes.INVALID_CREDENTIALS,
      });
    }

    // 2. Verify password match
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        code: ErrorCodes.INVALID_CREDENTIALS,
      });
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
