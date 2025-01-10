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
    const logger = new Logger();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(express()));

    const configService = app.get(ConfigService);
    const expressApp = app.getHttpAdapter().getInstance();

    app.use(cookieParser());

    const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
    const allowedOrigins = [corsOrigin, 'http://localhost:8888'];

    console.log(corsOrigin);

    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
    });

    expressApp.get('/', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 200,
            message: `Hello from ${configService.get('app.name')}`,
            timestamp: new Date().toISOString(),
        });
    });

    const port: number = configService.get<number>('app.http.port');
    const host: string = configService.get<string>('app.http.host');
    const globalPrefix: string = configService.get<string>('app.globalPrefix');
    const versioningPrefix: string = configService.get<string>('app.versioning.prefix');
    const version: string = configService.get<string>('app.versioning.version');
    const versionEnable: string = configService.get<string>('app.versioning.enable');
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix(globalPrefix);
    if (versionEnable) {
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: version,
            prefix: versioningPrefix,
        });
    }
    setupSwagger(app);
    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [`${configService.get('rmq.uri')}`],
            queue: `${configService.get('rmq.auth')}`,
            queueOptions: { durable: false },
            prefetchCount: 1,
        },
    });
    await app.startAllMicroservices();
    await app.listen(port, host);
    logger.log(`🚀 ${configService.get('app.name')} service started successfully on port ${port}`);
}
bootstrap();
