import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../services/token.service';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  public constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.getArgByIndex(0);
      const allowUnauthorizedRequest = this.reflector.get<boolean>('allowUnauthorizedRequest', context.getHandler());
      if (allowUnauthorizedRequest) {
        return true;
      }
      const Authorization = request.headers['authorization'];
      if (!Authorization) {
        throw new UnauthorizedException();
      }
      const token = Authorization.replace('Bearer ', '');
      const decode = await this.tokenService.decodeToken(token);
      if (!decode) {
        throw new UnauthorizedException();
      }
      request.userId = decode.userId;
      return true;
    } catch (e) {
      return false;
    }
  }
}
