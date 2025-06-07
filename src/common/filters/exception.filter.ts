import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import * as Sentry from '@sentry/node';
import { IErrorResponse } from '../interfaces/response.interface';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ResponseExceptionFilter.name);
    private readonly isProduction: boolean;
    private readonly isDebugMode: boolean;

    constructor(
        private readonly i18nService: I18nService,
        private readonly configService: ConfigService,
    ) {
        this.isProduction = this.configService.get<string>('app.env') === 'production';
        this.isDebugMode = this.configService.get<boolean>('app.debug') === true;
        this.initSentry();
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const statusCode = this.getStatusCode(exception);
        const message = this.getMessage(exception);

        const errorResponse: IErrorResponse = {
            statusCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ...this.getDebugInfo(exception),
        };

        this.logError(request, exception, statusCode);

        if (statusCode >= 500) {
            this.captureException(exception, request);
        }

        response.status(statusCode).json(errorResponse);
    }

    private initSentry(): void {
        const sentryDsn = this.configService.get<string>('app.sentry.dsn');
        if (sentryDsn && this.isProduction) {
            Sentry.init({
                dsn: sentryDsn,
                environment: this.configService.get<string>('app.env'),
                tracesSampleRate: 0.1,
            });
        }
    }

    private getStatusCode(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getMessage(exception: unknown): string | string[] {
        if (!(exception instanceof HttpException)) {
            return this.isProduction ? 'Internal server error' : String(exception);
        }

        const response = exception.getResponse();

        if (typeof response === 'object' && 'message' in response) {
            const message = response.message as string | string[];
            return Array.isArray(message)
                ? message.map(msg => this.translateMessage(msg, exception.getStatus()))
                : this.translateMessage(message, exception.getStatus());
        }

        return typeof response === 'string'
            ? this.translateMessage(response, exception.getStatus())
            : 'Internal server error';
    }

    private translateMessage(message: string, statusCode: number): string {
        try {
            return this.i18nService.translate(message, {
                defaultValue: this.i18nService.translate(`http.error.${statusCode}`, {
                    lang: 'en',
                }),
            });
        } catch {
            return message;
        }
    }

    private getDebugInfo(exception: unknown) {
        if (!this.isDebugMode || this.isProduction) {
            return {};
        }

        if (exception instanceof Error) {
            return {
                error: exception.name,
                stack: exception.stack,
            };
        }

        return {};
    }

    private logError(request: Request, exception: unknown, statusCode: number): void {
        const { method, url, body, query, headers } = request;
        const userAgent = headers['user-agent'] || 'Unknown';

        const logContext = {
            method,
            url,
            statusCode,
            userAgent,
            body: this.sanitizeBody(body),
            query,
        };

        if (statusCode >= 500) {
            this.logger.error(
                `Server Error: ${method} ${url}`,
                exception instanceof Error ? exception.stack : exception,
                JSON.stringify(logContext, null, 2),
            );
        } else if (statusCode >= 400) {
            this.logger.warn(
                `Client Error: ${method} ${url} - ${statusCode}`,
                JSON.stringify(logContext, null, 2),
            );
        }
    }

    private captureException(exception: unknown, request: Request): void {
        if (this.isProduction) {
            Sentry.withScope(scope => {
                scope.setExtras({
                    requestUrl: request.url,
                    method: request.method,
                    body: this.sanitizeBody(request.body),
                    query: request.query,
                    headers: this.sanitizeHeaders(request.headers),
                });

                Sentry.captureException(
                    exception instanceof Error ? exception : new Error(String(exception)),
                );
            });
        }
    }

    private sanitizeBody(body: any): any {
        if (!body || typeof body !== 'object') return body;

        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key'];

        sensitiveFields.forEach(field => {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    private sanitizeHeaders(headers: any): any {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

        sensitiveHeaders.forEach(header => {
            if (header in sanitized) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}
