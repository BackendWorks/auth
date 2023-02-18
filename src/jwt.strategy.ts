import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { ConfigService } from './config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('authSecret'),
    });
  }

  validateToken(token: string) {
    return this.jwtService.decode(token);
  }

  async validate(payload: any) {
    return { userId: payload.userId, role: payload.role };
  }

  generateToken(payload: { userId: number; role: Role }) {
    return this.jwtService.sign(payload);
  }
}
