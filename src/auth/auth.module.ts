import { Module } from '@nestjs/common';
import { UserModule } from 'src/users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TFAJwtStrategy } from './tfa-jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('KEY_JWT'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TFAJwtStrategy],
})
export class AuthModule {}
