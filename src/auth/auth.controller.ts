import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDTO, UserDTO, UserLoginDTO } from 'src/users/user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() user: UserLoginDTO) {
    return this.authService.login(user);
  }

  @Post('register')
  createUser(@Body() user: CreateUserDTO): UserDTO {
    const result = this.authService.register(user);
    return plainToInstance(UserDTO, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refreshToken(@Body() body, @Request() req) {
    const result = this.authService.refreshToken(
      body.refresh_token,
      req.user.email,
    );
    return result;
  }

  @Get('active/:id')
  acitvedAcount(@Param('id') id: string) {
    return this.authService.acitvedAccount(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('send-otp')
  sendOTP(@Request() req) {
    return this.authService.sendOTP(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  verifyOTP(@Request() req, @Body() body) {
    return this.authService.verifyOTP(req.user, body.code);
  }
}
