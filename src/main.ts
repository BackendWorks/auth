import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { join } from 'path';

import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
    const expressInstance = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

    const configService = app.get(ConfigService);
    const logger = app.get(Logger);
    const expressApp = app.getHttpAdapter().getInstance();

    // Get config strictly without defaults
    const appName = configService.getOrThrow<string>('app.name');
    const env = configService.getOrThrow<string>('app.env');
    const port = configService.getOrThrow<number>('app.http.port');
    const host = configService.getOrThrow<string>('app.http.host');

    const versioningEnabled = configService.getOrThrow<boolean>('app.versioning.enable');
    const version = configService.getOrThrow<string>('app.versioning.version');
    const versionPrefix = configService.getOrThrow<string>('app.versioning.prefix');

    // CORS configuration
    const corsOrigins = configService.get<string[]>('app.cors.origins', ['http://localhost:3000']);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Enhanced security configuration
    app.use(
        helmet({
            crossOriginOpenerPolicy: false,
            contentSecurityPolicy: env === 'production' ? undefined : false,
            hsts: env === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
        }),
    );

    // Enhanced validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // Strip unknown properties
            forbidNonWhitelisted: true, // Throw error on unknown properties
            validateCustomDecorators: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // API versioning
    if (versioningEnabled) {
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: version,
            prefix: versionPrefix,
        });
    }

    // Enhanced health check route
    expressApp.get('/', (_req: Request, res: Response) => {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();

        res.status(200).json({
            status: 'ok',
            statusCode: 200,
            message: `Hello from ${appName}`,
            timestamp: new Date().toISOString(),
            environment: env,
            version: version,
            uptime: `${Math.floor(uptime)} seconds`,
            memory: {
                used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
            },
        });
    });

    // Health check endpoint
    expressApp.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    // Swagger only for non-prod
    if (env !== 'production') {
        setupSwagger(app);
    }

    // Graceful shutdown support with enhanced handlers
    app.enableShutdownHooks();

    // Enhanced process event handlers
    const gracefulShutdown = (signal: string) => {
        logger.log(`🛑 Received ${signal}, starting graceful shutdown...`);
        app.close()
            .then(() => {
                logger.log('✅ Application closed gracefully');
                process.exit(0);
            })
            .catch(err => {
                logger.error('❌ Error during graceful shutdown', err);
                process.exit(1);
            });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', err => {
        logger.error('💥 Uncaught Exception', err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

    // Setup gRPC microservice
    const grpcUrl = configService.get<string>('grpc.url');
    const grpcPackage = configService.get<string>('grpc.package');

    const grpcOptions: MicroserviceOptions = {
        transport: Transport.GRPC,
        options: {
            package: grpcPackage,
            protoPath: join(__dirname, '../src/protos/auth.proto'),
            url: grpcUrl,
        },
    };

    try {
        // Start HTTP server
        await app.listen(port, host);
        logger.log(`🚀 ${appName} HTTP server started at http://${host}:${port}`);

        // Start gRPC server
        app.connectMicroservice<MicroserviceOptions>(grpcOptions);
        await app.startAllMicroservices();
        logger.log(`🔌 gRPC server started at ${grpcUrl}`);

        if (env !== 'production') {
            logger.log(`📖 Swagger available at http://${host}:${port}/docs`);
        }
        logger.log(`🏥 Health check available at http://${host}:${port}/health`);
        logger.log(`🌍 Environment: ${env}`);
    } catch (err) {
        logger.error(`❌ Failed to start ${appName}`, err);
        process.exit(1);
    }
}

bootstrap();
