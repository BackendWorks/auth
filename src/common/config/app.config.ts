import { registerAs } from '@nestjs/config';

export default registerAs(
    'app',
    (): Record<string, unknown> => ({
        name: process.env.APP_NAME ?? 'auth',
        env: process.env.APP_ENV ?? 'development',
        versioning: {
            enable: process.env.HTTP_VERSIONING_ENABLE === 'true',
            prefix: 'v',
            version: process.env.HTTP_VERSION ?? '1',
        },
        globalPrefix: '/api',
        http: {
            enable: process.env.HTTP_ENABLE === 'true',
            host: process.env.HTTP_HOST ?? '0.0.0.0',
            port: process.env.HTTP_PORT ? Number.parseInt(process.env.HTTP_PORT) : 9001,
        },
    }),
);
