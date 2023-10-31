import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthJwtAccessGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: Error, user: TUser, _info: Error): TUser {
    if (err || !user) {
      throw new UnauthorizedException('accessTokenUnauthorized');
    }
    return user;
  }
}
