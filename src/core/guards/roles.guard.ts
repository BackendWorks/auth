import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../services';

@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization'];
    token = token.replce('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException();
    }
    const user = this.tokenService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return requiredRoles.some((role) => user['role']?.includes(role));
  }
}
