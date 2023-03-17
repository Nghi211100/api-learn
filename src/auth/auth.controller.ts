import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UserDTO } from 'src/users/user.dto';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() user: UserDTO) {
    return this.authService.login(user);
  }
}
