import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthJwtAccessGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest<TUser = any | boolean>(
    err: Error,
    user: TUser,
    _info: Error,
    context,
  ): TUser {
    const isRpc = context.getType() === 'rpc';
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic || isRpc) {
      return;
    }
    if (err || !user) {
      throw new UnauthorizedException('accessTokenUnauthorized');
    }
    return user;
  }
}
