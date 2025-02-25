import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { registerAs } from '@nestjs/config';
import { APP_ENVIRONMENT } from 'src/common/enums/app.enum';

export default registerAs(
    'app',
    (): {
        [key: string]:
            | string
            | number
            | boolean
            | CorsOptions
            | { [key: string]: string | number | boolean };
    } => {
        const corsOrigins =
            process.env.APP_CORS_ORIGINS !== '*'
                ? process.env.APP_CORS_ORIGINS.split(',').map((origin) =>
                      origin.trim(),
                  )
                : true;

        const corsConfig: CorsOptions = {
            origin: corsOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
            exposedHeaders: ['Content-Range', 'X-Content-Range'],
        };

        return {
            env: process.env.APP_ENV ?? APP_ENVIRONMENT.LOCAL,
            name: process.env.APP_NAME ?? 'NestJS API',

            versioning: {
                enable: process.env.HTTP_VERSIONING_ENABLE === 'true',
                prefix: 'v',
                version: process.env.HTTP_VERSION ?? '1',
            },

            throttle: {
                ttl: 60,
                limit: 10,
            },

            http: {
                host: process.env.HTTP_HOST ?? 'localhost',
                port: process.env.HTTP_PORT
                    ? Number.parseInt(process.env.HTTP_PORT)
                    : 3001,
            },

            cors: corsConfig,

            sentry: {
                dsn: process.env.SENTRY_DSN,
                env: process.env.NODE_ENV ?? APP_ENVIRONMENT.LOCAL,
            },

            globalPrefix: '/',
            debug: process.env.APP_DEBUG === 'true',
            logLevel: process.env.APP_LOG_LEVEL ?? 'info',
        };
    },
);
