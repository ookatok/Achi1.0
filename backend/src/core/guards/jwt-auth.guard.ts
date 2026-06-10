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
      const secret = process.env.AUTH_SECRET || 'secret';
      const decoded = jwt.verify(token, secret);
      request.user = decoded; // Attach user claims to request object
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token signature validation failed');
    }
  }
}
