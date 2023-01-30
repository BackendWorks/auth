import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, ResponseInterceptor } from './core/interceptor';
import { ConfigService } from './core/services';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

function configureSwagger(app): void {
  const config = new DocumentBuilder()
    .setTitle('auth')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
}

async function bootstrap() {
  const server = express();
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bufferLogs: true,
    cors: true,
  });
  const configService = app.get(ConfigService);
  const moduleRef = app.select(AppModule);
  const reflector = moduleRef.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  configureSwagger(app);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get('rb_url')}`],
      queue: `${configService.get('auth_queue')}`,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get('servicePort'));
  logger.log(
    `🚀 Auth service running on port ${configService.get('servicePort')}`,
  );
}
bootstrap();
