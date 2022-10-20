import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from './config/config.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './core/exception.interceptor';
import { LocalizationModule } from '@squareboat/nestjs-localization/dist/src';
import * as path from 'path';
import { PrismaService } from './core/services/prisma.service';
import { ClientAuthGuard } from './core/guards/auth.guard';
import { TokenService } from './core/services/token.service';

@Module({
  imports: [
    ConfigModule,
    LocalizationModule.register({
      path: path.join(__dirname, '/locales/'),
      fallbackLang: 'en',
    }),
    ClientsModule.registerAsync([
      {
        name: 'MAIL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('rb_url')}`],
            queue: `${configService.get('mailer_queue')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    AppService,
    PrismaService,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: ClientAuthGuard,
    },
  ],
})
export class AppModule { }
