import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { registerAs } from '@nestjs/config';

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
                ? process.env.APP_CORS_ORIGINS.split(',').map(origin => origin.trim())
                : true;

        const corsConfig: CorsOptions = {
            origin: corsOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
            exposedHeaders: ['Content-Range', 'X-Content-Range'],
        };

        return {
            env: process.env.APP_ENV ?? 'local',
            name: process.env.APP_NAME ?? 'Auth Service',

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
                host: process.env.HTTP_HOST ?? '0.0.0.0',
                port: process.env.HTTP_PORT ? Number.parseInt(process.env.HTTP_PORT) : 9001,
            },

            cors: corsConfig,

            sentry: {
                dsn: process.env.SENTRY_DSN,
                env: process.env.NODE_ENV ?? 'local',
            },

            globalPrefix: '/',
            debug: process.env.APP_DEBUG === 'true',
            logLevel: process.env.APP_LOG_LEVEL ?? 'info',
        };
    },
);
