import { Module } from '@nestjs/common';
import { join } from 'path';
import configs from '../config';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { CoreModule } from 'src/core/core.module';
import { PrismaService } from 'src/core/services/prisma.service';
import { UserModule } from 'src/modules/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { HelperHashService } from 'src/modules/auth/services/helper.hash.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    CoreModule,
    UserModule,
    AuthModule,
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
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, JwtService, AuthService, HelperHashService],
})
export class AppModule {}
