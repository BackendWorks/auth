import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class TokenService {
  private secret: string;
  constructor(private configService: ConfigService) {
    this.secret = this.configService.get('authSecret');
  }

  async validateToken(
    token: string,
  ): Promise<{ userId: number; role: Role } | string | JwtPayload> {
    return verify(token, this.secret);
  }

  async generateToken(payload: { userId: number; role: Role }) {
    return sign(
      {
        userId: payload.userId,
        role: payload.role,
      },
      this.secret,
      {
        expiresIn: '24h',
        header: {
          typ: 'JWT',
          alg: 'HS256',
        },
      },
    );
  }
}
