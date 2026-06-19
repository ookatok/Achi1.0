import { Controller, Post, Body, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { RegisterSchema, LoginSchema, RegisterDto, LoginDto } from './dto/auth.dto';
import { CheckHoneypot } from '../../core/decorators/honeypot.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @CheckHoneypot({
    fields: ['website'],
    fakeResponse: (req: any) => ({
      id: Math.floor(Math.random() * 10000) + 1,
      name: req.body?.name || 'Client',
      email: req.body?.email || 'client@example.com',
      role: 'customer',
      createdAt: new Date().toISOString(),
    }),
  })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
