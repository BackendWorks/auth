import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TokenService {
  private secret: string;
  private key: string;
  constructor(private configService: ConfigService) {
    this.secret = this.configService.get('authSecret');
    this.key = this.configService.get('authKey');
  }

  validateToken(
    token: string,
  ): { userId: number; role: Role } | string | JwtPayload {
    return verify(token, this.secret);
  }

  generateToken(payload: { userId: number; role: Role }) {
    return sign(
      {
        userId: payload.userId,
        role: payload.role,
      },
      this.secret,
      {
        expiresIn: '24h',
        header: {
          kid: this.key,
          typ: 'JWT',
          alg: 'HS256',
        },
      },
    );
  }
}
