import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { TokenDTO, UserDTO } from 'src/users/user.dto';
import { UserService } from 'src/users/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async validateUser(user: UserDTO) {
    const res = await this.userService.getUserByObject({
      email: user.email,
    });
    const resPlain = plainToInstance(UserDTO, res);
    if (res && (await bcrypt.compare(user.password, resPlain.password))) {
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
      const payload = { id: result.id, email: result.email };
      const resultToken = await this.createToken(payload, true);
      return {
        message: 'Login successful!',
        resultToken,
      };
    }
    return 'An error occurred while logging in, please check email or password!';
  }

  register(user: UserDTO) {
    return this.userService.saveUser(user);
  }

  async refreshToken(refresh_token: string, email: string) {
    try {
      await this.jwtService.verify(refresh_token, {
        secret: this.configService.get('KEY_REFRESH'),
      });
    } catch (error) {
      return 'The token key is incorrect or expired';
    }
    const resultUser = await this.userService.getUserByRefreshToken(
      refresh_token,
      email,
    );
    if (typeof resultUser !== 'string') {
      const payload = { email: resultUser.email, id: resultUser.id };
      return this.createToken(payload, false);
    }
    return resultUser;
  }

  async createToken(payload: TokenDTO, refresh: boolean) {
    const accessToken = this.jwtService.sign(payload);

    if (refresh) {
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('KEY_REFRESH'),
        expiresIn: '7d',
      });
      this.userService.updateUserById(payload.id, {
        refresh_token: await bcrypt.hash(refreshToken, 10),
      });
      return { access_token: accessToken, refresh_token: refreshToken };
    } else {
      return { access_token: accessToken };
    }
  }

  async acitvedAcount(id): Promise<string> {
    try {
      await this.userService.updateUserById(id, {
        isActive: true,
      });
      return 'Your account is actived!';
    } catch (error) {
      return 'An error occurred while activing!';
    }
  }
}
