import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { I18nService } from 'nestjs-i18n';
import { Observable, firstValueFrom, of } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode: number = response.statusCode;
    const responseBody = await firstValueFrom(next.handle());
    const message = await this.i18n.t(`success.${statusCode}`);

    return of({
      statusCode,
      timestamp: new Date().toISOString(),
      message,
      data: responseBody,
    });
  }
}
