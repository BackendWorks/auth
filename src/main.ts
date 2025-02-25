import 'reflect-metadata';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { APP_ENVIRONMENT } from './common/enums/app.enum';
import setupSwagger from './swagger';

async function bootstrap(): Promise<void> {
    try {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(express()),
            {
                bufferLogs: true,
            },
        );

        const config = app.get(ConfigService);
        const logger = app.get(Logger);
        const env = config.get<string>('app.env');
        const host = config.get<string>('app.http.host');
        const port = config.get<number>('app.http.port');
        const {
            brokers: kafkaBrokers,
            clientId: kafkaClientId,
            consumer: { groupId: consumerGroup },
        } = config.get('kafka');

        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.KAFKA,
            options: {
                client: {
                    brokers: kafkaBrokers,
                    clientId: kafkaClientId,
                    retry: {
                        retries: 10,
                        initialRetryTime: 100,
                        maxRetryTime: 30000,
                    },
                },
                consumer: {
                    groupId: consumerGroup,
                    allowAutoTopicCreation: true,
                    sessionTimeout: 30000,
                },
                producer: {
                    allowAutoTopicCreation: true,
                },
                subscribe: {
                    fromBeginning: true,
                },
            },
        });

        app.use(helmet());
        app.use(compression());
        app.enableCors(config.get('app.cors'));
        app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

        useContainer(app.select(AppModule), { fallbackOnErrors: true });

        if (env !== APP_ENVIRONMENT.PRODUCTION) {
            setupSwagger(app);
        }

        await app.startAllMicroservices();
        await app.listen(port, host);

        logger.log(`🚀 Server: ${await app.getUrl()}`);
        logger.log(`📖 Docs: ${await app.getUrl()}/docs`);
        logger.log(`📬 Kafka connected: ${kafkaBrokers}`);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
            'Bootstrap failed:',
            error instanceof Error ? error.stack : error,
        );
        process.exit(1);
    }
}

bootstrap();
