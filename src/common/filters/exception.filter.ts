import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ResponseExceptionFilter.name);

    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
    ) {
        const sentryDsn = this.configService.get<string>('app.sentry.dsn');
        if (sentryDsn) {
            Sentry.init({
                dsn: sentryDsn,
                environment: this.configService.get<string>('app.sentry.env'),
            });
        }
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const isDebugMode = this.configService.get<string>('app.debug');

        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string | string[] = 'An unexpected error occured';

        if (exception instanceof BadRequestException) {
            const response = exception.getResponse() as {
                message: string | string[];
            };
            if (Array.isArray(response.message)) {
                message = response.message;
            }
        } else if (exception instanceof HttpException) {
            const response = exception.getResponse() as
                | { message: string }
                | string;
            const _message =
                typeof response === 'object' ? response.message : response;

            message = this.i18n.translate(_message, {
                defaultValue: _message,
            });
        }

        const errorResponse = {
            statusCode,
            message,
            timestamp: new Date().toISOString(),
            ...(isDebugMode &&
                exception instanceof Error && { error: exception.stack }),
        };

        if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
            Sentry.withScope((scope) => {
                scope.setExtras({
                    requestUrl: request.url,
                    method: request.method,
                    body: request.body,
                    query: request.query,
                });
                Sentry.captureException(
                    exception instanceof Error ? exception : message,
                );
            });
            this.logger.error(
                `Request failed: ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        response.status(statusCode).json(errorResponse);
    }
}
