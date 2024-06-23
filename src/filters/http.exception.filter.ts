import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const translationKey =
      exception instanceof HttpException && exception.message
        ? exception.message
        : 'response.500';

    const message = await this.i18n.t(translationKey, {
      lang: request.headers['accept-language'] || 'en',
    });

    let error = {};

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      error = await Promise.all(
        response['message'].map((msg: string) => this.i18n.t(msg)),
      );
    }

    const errorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      message,
      error,
    };

    let errorDetails: Record<string, unknown>;

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorDetails = {
        ...errorResponse,
        stack: exception instanceof Error ? exception.stack : undefined,
      };
      this.logger.error(JSON.stringify(errorDetails));
    }

    response.status(statusCode).json(errorResponse);
  }
}
