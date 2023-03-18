import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserDTO } from 'src/users/user.dto';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(user: UserDTO) {
    const res = await this.userService.getUserByUserName(user.userName);
    const resPlain = plainToInstance(UserDTO, res);
    if (res && (await compare(user.password, resPlain.password))) {
      const { password, ...result } = resPlain;
      return result;
    }
    return 'failed';
  }

  async login(user: UserDTO) {
    const result = await this.validateUser(user);
    if (result !== 'failed') {
      const checkUserActived = await this.userService.checkUserActived(
        result.id,
      );
      if (checkUserActived) return checkUserActived;
      const payload = { userName: result.userName, id: result.id };
      return {
        message: 'Login successful!',
        access_token: this.jwtService.sign(payload),
      };
    }
    return 'An error occurred while logging in, please check username or password!';
  }

  register(user: UserDTO) {
    return this.userService.saveUser(user);
  }
}
