import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/modules/user/user.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { GlobalExceptionFilter } from 'src/interceptors/exception.interceptor';
import { LoggingMiddleware } from '../middlewares/logging.middleware';
import { AuthJwtAccessGuard } from 'src/guards/jwt.access.guard';
import { PermissionsGuard } from 'src/guards/permission.guard';

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
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthJwtAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
