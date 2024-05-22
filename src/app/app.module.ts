import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { CommonModule } from 'src/common/common.module';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserModule } from 'src/modules/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { HelperHashService } from 'src/modules/auth/services/helper.hash.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { GlobalExceptionFilter } from 'src/interceptors/exception.interceptor';
import { LoggingMiddleware } from '../middlewares/logging.middleware';

@Module({
  imports: [
    CommonModule,
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    JwtService,
    AuthService,
    HelperHashService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
