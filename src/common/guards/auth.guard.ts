import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PUBLIC_ROUTE_KEY } from '../constants/request.constant';
import { AuthService } from '../../modules/auth/services/auth.service';

@Injectable()
export class AuthGuard {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isRpc = context.getType() === 'rpc';
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            PUBLIC_ROUTE_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic || isRpc) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException(
                'auth.error.accessTokenUnauthorized',
            );
        }

        try {
            const payload = await this.authService.verifyToken(token);
            request.user = payload;
        } catch {
            throw new UnauthorizedException(
                'auth.error.accessTokenUnauthorized',
            );
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
