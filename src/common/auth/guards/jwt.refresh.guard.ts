import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthJwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }

  handleRequest<TUser = any | boolean>(
    err: Error,
    user: TUser,
    _info: Error,
    context,
  ): TUser {
    const isRpc = context.getType() === 'rpc';
    if (isRpc) {
      return;
    }

    if (err || !user) {
      throw new UnauthorizedException('refreshTokenUnauthorized');
    }
    return user;
  }
}
