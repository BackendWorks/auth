import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    try {
        const app = await NestFactory.create(AppModule, new ExpressAdapter(express()));
        const configService = app.get(ConfigService);
        const expressApp = app.getHttpAdapter().getInstance();

        // Enable cookie parser
        app.use(cookieParser());
        logger.log('✅ Cookie parser enabled');

        // Configure CORS
        const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
        const allowedOrigins = [corsOrigin, 'http://localhost:8888'];
        app.enableCors({
            origin: allowedOrigins,
            methods: 'GET,POST,PUT,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type,Authorization',
            credentials: true,
        });
        logger.log(`✅ CORS enabled with allowed origins: ${allowedOrigins.join(', ')}`);

        // Health check endpoint
        expressApp.get('/', (_req: Request, res: Response) => {
            res.status(200).json({
                status: 200,
                message: `Hello from ${configService.get('app.name')}`,
                timestamp: new Date().toISOString(),
            });
        });
        logger.log('✅ Health check endpoint initialized');

        // Retrieve configuration values
        const port: number = configService.get<number>('app.http.port', 3000);
        const host: string = configService.get<string>('app.http.host', '0.0.0.0');
        const globalPrefix: string = configService.get<string>('app.globalPrefix', 'api');
        const versioningPrefix: string = configService.get<string>('app.versioning.prefix', 'v');
        const version: string = configService.get<string>('app.versioning.version', '1');
        const versionEnable: boolean = configService.get<boolean>('app.versioning.enable', true);

        // Middleware setup
        app.use(helmet());
        logger.log('✅ Helmet enabled for security');
        app.useGlobalPipes(new ValidationPipe());
        logger.log('✅ Validation pipe enabled');
        app.setGlobalPrefix(globalPrefix);
        logger.log(`✅ Global prefix set to: ${globalPrefix}`);

        // Versioning
        if (versionEnable) {
            app.enableVersioning({
                type: VersioningType.URI,
                defaultVersion: version,
                prefix: versioningPrefix,
            });
            logger.log(
                `✅ API versioning enabled with prefix: ${versioningPrefix}, default version: ${version}`,
            );
        }

        // Swagger setup
        setupSwagger(app);
        logger.log('✅ Swagger initialized');

        // Microservice setup
        app.connectMicroservice({
            transport: Transport.RMQ,
            options: {
                urls: [configService.get<string>('rmq.uri')],
                queue: configService.get<string>('rmq.auth'),
                queueOptions: { durable: false },
                prefetchCount: 1,
            },
        });
        logger.log('✅ Microservice connected to RabbitMQ');

        // Start microservices and HTTP server
        await app.startAllMicroservices();
        logger.log('✅ Microservices started');
        await app.listen(port, host);
        logger.log(
            `🚀 ${configService.get('app.name')} service started successfully on ${host}:${port}`,
        );
    } catch (error) {
        logger.error('❌ Error during application bootstrap', error.stack);
        process.exit(1); // Exit with failure code
    }
}
bootstrap();
