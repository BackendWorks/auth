import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE_KEY } from 'src/app/app.constant';

@Injectable()
export class AuthJwtAccessGuard extends AuthGuard('jwt-access') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest<TUser = unknown | boolean>(
    err: Error,
    user: TUser,
    _info: Error,
    context,
  ): TUser {
    const isRpc = context.getType() === 'rpc';
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic || isRpc) {
      return;
    }

    if (err || !user) {
      throw new UnauthorizedException('auth.accessTokenUnauthorized');
    }
    return user;
  }
}
