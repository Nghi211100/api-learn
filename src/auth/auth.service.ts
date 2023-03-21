import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import {
  TokenDTO,
  TokenTFADTO,
  UserDTO,
  UserLoginDTO,
} from 'src/users/user.dto';
import { UserService } from 'src/users/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async validateUser(user: UserLoginDTO) {
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

  async login(user: UserLoginDTO) {
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
        expiresIn: '7 days',
      });
      this.userService.updateUserById(payload.id, {
        refresh_token: await bcrypt.hash(refreshToken, 10),
      });
      return { access_token: accessToken, refresh_token: refreshToken };
    } else {
      return { access_token: accessToken };
    }
  }

  async acitvedAccount(id: string): Promise<string> {
    try {
      await this.userService.updateUserById(id, {
        isActive: true,
      });
      return 'Your account is actived!';
    } catch (error) {
      return 'An error occurred while activing!';
    }
  }

  async sendOTP(id: string): Promise<string> {
    const secret = await speakeasy.generateSecret({ length: 20 });
    await this.userService.updateUserById(id, {
      code_secret: secret.base32,
    });
    const user = await this.userService.getUserById(id);
    const plainUser = await this.userService.plainUser(user);
    const otp = await speakeasy.totp({
      secret: user.code_secret,
      encoding: 'base32',
      digits: 6,
      window: 1,
      step: 60,
    });
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to my website',
      template: './otp',
      context: {
        name: plainUser.fullName,
        code: otp,
      },
    });
    return otp;
  }

  async verifyOTP(user: TokenTFADTO, code: string) {
    const resultUser = await this.userService.getUserById(user.id);
    const verified = speakeasy.totp.verify({
      secret: resultUser.code_secret,
      encoding: 'base32',
      token: code,
      digits: 6,
      window: 1,
      step: 60,
    });
    const payload = { id: resultUser.id, code: code };
    if (verified) {
      const tfaToken = await this.jwtService.sign(payload, {
        secret: this.configService.get('KEY_JWT_TFA'),
        expiresIn: 120,
      });
      return { access_token: tfaToken };
    }
    return verified;
  }
}
