import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { responseDTO } from 'src/common/base.respone';
import { CreateUserDTO, UserDTO, UserLoginDTO } from 'src/users/user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() user: UserLoginDTO, @Res() res: Response) {
    return this.authService.login(user, res);
  }

  @Post('register')
  async createUser(@Body() user: CreateUserDTO, @Res() res) {
    const result = await this.authService.register(user);
    const resultPlain = plainToInstance(UserDTO, result, {
      excludeExtraneousValues: true,
    });
    const resData: responseDTO = {
      status: HttpStatus.OK,
      message:
        'Register successfull, please check your email to activate your account!',
      data: resultPlain,
    };
    res.status(HttpStatus.OK).json(resData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refreshToken(@Body() body, @Request() req, @Res() res: Response) {
    const result = this.authService.refreshToken(
      body.refresh_token,
      req.user.email,
      res,
    );
    return result;
  }

  @Get('active/:id')
  acitvedAcount(@Param('id') id: string) {
    return this.authService.acitvedAccount(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('send-otp')
  async sendOTP(@Request() req, @Res() res: Response) {
    try {
      await this.authService.sendOTP(req.user.id);
      const resData: responseDTO = {
        status: HttpStatus.OK,
        message: 'Send OTP to email address successful!',
      };
      res.status(HttpStatus.OK).json(resData);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  verifyOTP(@Request() req, @Body() body) {
    return this.authService.verifyOTP(req.user, body.code);
  }
}
