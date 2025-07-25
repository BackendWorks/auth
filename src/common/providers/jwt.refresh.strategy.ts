import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthPayload, TokenType } from 'src/modules/auth/interfaces/auth.interface';

@Injectable()
export class AuthJwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('auth.refreshToken.secret'),
        });
    }

    async validate(payload: IAuthPayload): Promise<IAuthPayload> {
        if (!payload) {
            throw new UnauthorizedException('Invalid token payload');
        }

        if (payload.tokenType !== TokenType.REFRESH_TOKEN) {
            throw new UnauthorizedException('Invalid token type');
        }

        if (!payload.id || !payload.role) {
            throw new UnauthorizedException('Invalid token structure');
        }

        return {
            id: payload.id,
            role: payload.role,
            tokenType: payload.tokenType,
        };
    }
}
