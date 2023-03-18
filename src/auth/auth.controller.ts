import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserDTO } from 'src/users/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() user: UserDTO) {
    return this.authService.login(user);
  }

  @Post('register')
  createUser(@Body() user: UserDTO): UserDTO {
    const result = this.authService.register(user);
    return plainToInstance(UserDTO, result, {
      excludeExtraneousValues: true,
    });
  }
}
