import { Controller, Patch, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userRepo: UserRepository) {}

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: any, @Body() body: { name?: string; password?: string }) {
    const userId = req.user.id;
    const updateData: any = {};
    
    if (body.name) {
      updateData.name = body.name;
    }
    
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    
    await this.userRepo.update(userId, updateData);
    
    const updatedUser = await this.userRepo.findById(userId);
    if (!updatedUser) {
      return { message: 'User not found' };
    }
    
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }
}
