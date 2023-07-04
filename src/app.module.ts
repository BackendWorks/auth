import { Module } from '@nestjs/common';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { JwtService, PrismaService } from './services';
import { JwtAuthGuard, RolesGuard } from './core';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AuthModule } from './modules/v1/auth.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  imports: [
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
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
    JwtService,
    ConfigService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
