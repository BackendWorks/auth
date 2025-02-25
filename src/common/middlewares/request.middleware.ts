import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        const { method, originalUrl, ip } = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();

        response.on('finish', () => {
            const { statusCode } = response;
            const contentLength = response.get('content-length');
            const responseTime = Date.now() - startTime;

            this.logger.log(
                `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${responseTime}ms - ${ip} ${userAgent}`,
            );
        });

        next();
    }
}
