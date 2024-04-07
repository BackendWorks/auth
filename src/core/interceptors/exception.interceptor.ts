import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { isDev } from 'src/app/app.constant';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessageKey =
      exception instanceof HttpException
        ? exception.message
        : 'error.internalServerError';
    const message = await this.i18n.t(`translation.${errorMessageKey}`);

    if (isDev && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    const errorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    if (isDev || statusCode !== HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Error: ${JSON.stringify(errorResponse)}`);
    }

    response.status(statusCode).json(errorResponse);
  }
}
