import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Observable, map } from 'rxjs';

import { MESSAGE_KEY_METADATA } from '../constants/response.constant';
import { IApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private readonly i18n: I18nService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<unknown>> {
        return next.handle().pipe(
            map(payload => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                const messageKey = this.reflector.get<string>(
                    MESSAGE_KEY_METADATA,
                    context.getHandler(),
                );

                const message = (
                    messageKey
                        ? this.i18n.translate(messageKey, {
                              defaultValue: this.i18n.translate(`http.success.${statusCode}`),
                          })
                        : this.i18n.translate(`http.success.${statusCode}`)
                );

                return {
                    statusCode,
                    timestamp: new Date().toISOString(),
                    message,
                    data: payload,
                };
            }),
        );
    }
}
