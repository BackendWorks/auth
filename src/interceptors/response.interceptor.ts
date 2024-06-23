import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { Observable, firstValueFrom, of } from 'rxjs';
import {
  RESPONSE_MESSAGE_META_KEY,
  RESPONSE_SERIALIZATION_META_KEY,
} from 'src/app/app.constant';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly i18n: I18nService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode: number = response.statusCode;

    const messageSerialization: string = this.reflector.get<string>(
      RESPONSE_MESSAGE_META_KEY,
      context.getHandler(),
    );

    if (messageSerialization) {
      const message = await this.i18n.t(messageSerialization);

      return of({
        statusCode,
        timestamp: new Date().toISOString(),
        message,
        data: null,
      });
    }

    const responseBody = await firstValueFrom(next.handle());

    const message = await this.i18n.t(`response.${statusCode}`);

    const classSerialization: ClassConstructor<unknown> = this.reflector.get<
      ClassConstructor<unknown>
    >(RESPONSE_SERIALIZATION_META_KEY, context.getHandler());

    const serializedResponse = plainToInstance(
      classSerialization,
      responseBody,
    );

    return of({
      statusCode,
      timestamp: new Date().toISOString(),
      message,
      data: serializedResponse,
    });
  }
}
