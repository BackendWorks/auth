import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ResponseExceptionFilter.name);

    constructor(
        private readonly i18nService: I18nService,
        private readonly configService: ConfigService,
    ) {
        this.initSentry();
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const statusCode = this.getStatusCode(exception);
        const message = this.getMessage(exception);

        const errorResponse = {
            statusCode,
            message,
            timestamp: new Date().toISOString(),
            ...this.getDebugInfo(exception),
        };

        this.logError(request, exception, statusCode);
        response.status(statusCode).json(errorResponse);
    }

    private initSentry(): void {
        const sentryDsn = this.configService.get<string>('app.sentry.dsn');
        if (sentryDsn) {
            Sentry.init({
                dsn: sentryDsn,
                environment: this.configService.get<string>('app.sentry.env'),
            });
        }
    }

    private getStatusCode(exception: unknown): number {
        return exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getMessage(exception: unknown): string | string[] {
        if (!(exception instanceof HttpException)) {
            return 'Internal server error';
        }

        const response = exception.getResponse();

        if (typeof response === 'object' && 'message' in response) {
            const message = response.message as string | string[];
            return Array.isArray(message)
                ? message
                : this.translateMessage(message, exception.getStatus());
        }

        return typeof response === 'string'
            ? this.translateMessage(response, exception.getStatus())
            : 'Internal server error';
    }

    private translateMessage(message: string, statusCode: number): string {
        const defaultMessage = this.i18nService.translate(`http.error.${statusCode}`);
        return this.i18nService.translate(message, { defaultValue: 'Internal server error' });
    }

    private getDebugInfo(exception: unknown) {
        const isDebugMode = this.configService.get<string>('app.debug');
        return isDebugMode && exception instanceof Error ? { error: exception.stack } : {};
    }

    private logError(request: Request, exception: unknown, statusCode: number): void {
        if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logToSentry(request, exception);
            this.logger.error(
                `Request failed: ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }
    }

    private logToSentry(request: Request, exception: unknown): void {
        Sentry.withScope(scope => {
            scope.setExtras({
                requestUrl: request.url,
                method: request.method,
                body: request.body,
                query: request.query,
            });
            Sentry.captureException(
                exception instanceof Error ? exception : new Error(String(exception)),
            );
        });
    }
}
