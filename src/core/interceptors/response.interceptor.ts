import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, of } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  statusMessages: { [key: string]: string };
  public constructor(private readonly reflector: Reflector) {
    this.statusMessages = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      203: 'NonAuthoritativeInfo',
      204: 'NoContent',
      205: 'ResetContent',
      206: 'PartialContent',
    };
  }

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<any> {
    const body = await firstValueFrom(next.handle());
    const status =
      this.reflector.get<number>('__httpCode__', context.getHandler()) || 200;
    return of({
      statusCode: status,
      message: this.statusMessages[status],
      data: body,
    });
  }
}
