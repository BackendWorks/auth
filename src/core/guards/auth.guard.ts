import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../core/decorators';
import { TokenService } from '../services';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext) {
    const type = context.getType();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic || type === 'rpc') {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization'];
    token = token.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException();
    }
    const user = this.tokenService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    request.userId = user['userId'];
    return true;
  }
}
