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
import { firstValueFrom, of } from 'rxjs';
import {
  HTTP_SUCCESS_STATUS_MESSAGES,
  RESPONSE_SERIALIZATION_META_KEY,
} from 'src/app/app.constant';
import { GenericResponseDto } from 'src/modules/user/dtos/generic.response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const body = await firstValueFrom(next.handle());
    const status =
      this.reflector.get<number>('__httpCode__', context.getHandler()) || 200;
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const request = ctx.getRequest();

    const classSerialization: ClassConstructor<any> = this.reflector.get<
      ClassConstructor<any>
    >(RESPONSE_SERIALIZATION_META_KEY, context.getHandler());

    if (classSerialization?.name === GenericResponseDto?.name) {
      const getData = body as unknown as GenericResponseDto;
      getData.message = this.i18nService.translate(getData.message, {
        lang: request.headers['accept-language'] || 'en',
        defaultValue: 'Operation successful.',
      });
      const responseData = plainToInstance(classSerialization, getData);
      return of({
        statusCode: status,
        message: HTTP_SUCCESS_STATUS_MESSAGES[status],
        data: responseData,
      });
    }
    const responseData = plainToInstance(classSerialization, body);
    return of({
      statusCode: status,
      message: HTTP_SUCCESS_STATUS_MESSAGES[status],
      data: responseData,
    });
  }
}
