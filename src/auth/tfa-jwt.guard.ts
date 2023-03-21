import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TFAJwtAuthGuard extends AuthGuard('tfa-jwt') {}
