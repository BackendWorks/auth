import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import * as messages from '../i18n/en/translation.json';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const i18n = I18nContext.current(host);
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (typeof exception.getResponse() === 'object') {
      response.status(statusCode).send(exception.getResponse());
    } else {
      let message: string;
      if (Object.keys(messages).some((key) => key !== exception.message)) {
        message = exception.message;
      } else {
        message = await i18n.t(`translation.${exception.message}`);
      }
      response.status(statusCode).json({
        statusCode,
        message,
      });
    }
  }
}
