import { join } from 'path';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

import configs from './config';
import { AuthJwtAccessGuard } from './guards/jwt.access.guard';
import { RolesGuard } from './guards/roles.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AuthJwtAccessStrategy } from './providers/jwt.access.strategy';
import { AuthJwtRefreshStrategy } from './providers/jwt.refresh.strategy';
import { HashService } from './services/hash.service';
import { DatabaseService } from './services/database.service';
import { ResponseExceptionFilter } from './filters/exception.filter';
import { RequestMiddleware } from './middlewares/request.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: configs,
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
            expandVariables: true,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: join(__dirname, '../languages/'),
                watch: true,
            },
            resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
        }),
    ],
    providers: [
        DatabaseService,
        HashService,
        AuthJwtAccessStrategy,
        AuthJwtRefreshStrategy,
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: ResponseExceptionFilter,
        },
        {
            provide: APP_GUARD,
            useClass: AuthJwtAccessGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [DatabaseService, HashService, AuthJwtAccessStrategy, AuthJwtRefreshStrategy],
})
export class CommonModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestMiddleware).forRoutes('*');
    }
}
