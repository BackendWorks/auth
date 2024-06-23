import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDebugEnv: boolean;

  constructor(
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {
    this.isDebugEnv = this.configService.get('app.debug');
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessageKey =
      exception instanceof HttpException ? exception.message : 'error.500';

    const message = await this.i18n.t(`${errorMessageKey}`);

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    const errorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      message,
      error: this.isDebugEnv && statusCode === 500 ? exception['stack'] : null,
    };

    response.status(statusCode).json(errorResponse);
  }
}
