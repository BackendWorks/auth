import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';
import type { MicroserviceOptions} from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
    const logger = new Logger();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(express()), {
        cors: true,
    });

    const configService = app.get(ConfigService);
    const expressApp = app.getHttpAdapter().getInstance();

    expressApp.get('/', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 200,
            message: `Hello from ${configService.get('app.name')}`,
            timestamp: new Date().toISOString(),
        });
    });

    const port = configService.get<number>('app.http.port') ?? 9001;
    const host = configService.get<string>('app.http.host') ?? 'localhost';
    const globalPrefix = configService.get<string>('app.globalPrefix');
    const versioningPrefix = configService.get<string>('app.versioning.prefix');
    const version = configService.get<string>('app.versioning.version');
    const versionEnable = configService.get<string>('app.versioning.enable');
    const grpcUrl = configService.get<string>('grpc.url');
    const grpcPackage = configService.get<string>('grpc.package');
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix(globalPrefix ?? 'api');
    if (versionEnable) {
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: version ?? '1',
            prefix: versioningPrefix ?? 'v',
        });
    }
    setupSwagger(app);
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            package: grpcPackage,
            protoPath: join(__dirname, './protos/auth.proto'),
            url: grpcUrl,
        },
    });
    await app.startAllMicroservices();
    await app.listen(port, host);
    logger.log(`🚀 ${configService.get('app.name')} service started successfully on port ${port}`);
}
bootstrap();
