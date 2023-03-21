import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenTFADTO } from 'src/users/user.dto';

@Injectable()
export class TFAJwtStrategy extends PassportStrategy(Strategy, 'tfa-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.KEY_JWT_TFA,
    });
  }

  async validate(user: TokenTFADTO) {
    return { id: user.id, code: user.code };
  }
}
