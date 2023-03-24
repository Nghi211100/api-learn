import {
  Injectable,
  HttpStatus,
  NotImplementedException,
  NotAcceptableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import {
  CreateUserDTO,
  TokenDTO,
  TokenTFADTO,
  UserDTO,
  UserLoginDTO,
} from 'src/users/user.dto';
import { UserService } from 'src/users/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';
import { responseDTO } from 'src/common/base.respone';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = resPlain;
      return result;
    }
    return 'failed';
  }

  async login(user: UserLoginDTO, res: Response) {
    const result = await this.validateUser(user);
    if (result !== 'failed') {
      const checkUserActived = await this.userService.checkUserActived(
        result.id,
      );
      if (checkUserActived) return checkUserActived;
      const payload = { id: result.id, email: result.email };
      const resultToken = await this.createToken(payload, true);

      const resData: responseDTO = {
        status: HttpStatus.OK,
        message: 'Login successful!',
        data: resultToken,
      };

      res.status(HttpStatus.OK).json(resData);
    }
    throw new NotImplementedException(
      'An error occurred while logging in, please check email or password!',
    );
  }

  async register(user: CreateUserDTO) {
    return await this.userService.saveUser(user);
  }

  async refreshToken(refresh_token: string, email: string, res: Response) {
    try {
      await this.jwtService.verify(refresh_token, {
        secret: this.configService.get('KEY_REFRESH'),
      });
    } catch (error) {
      throw new NotAcceptableException('The token key is incorrect or expired');
    }
    const resultUser = await this.userService.getUserByRefreshToken(
      refresh_token,
      email,
    );
    if (typeof resultUser !== 'string') {
      const payload = { email: resultUser.email, id: resultUser.id };
      const resultToken = await this.createToken(payload, false);
      const resData: responseDTO = {
        status: HttpStatus.OK,
        message: 'Delete Successful!',
        data: resultToken,
      };
      res.status(HttpStatus.OK).json(resData);
    }
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
    this.mailerService.sendMail({
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
