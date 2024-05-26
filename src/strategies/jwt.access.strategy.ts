import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';

@Injectable()
export class AuthJwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.accessToken.secret'),
    });
  }

  async validate(payload: IAuthPayload) {
    return payload;
  }
}
