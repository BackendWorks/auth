import { Module } from '@nestjs/common';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { CoreModule } from 'src/core/core.module';
import { CommonModule } from 'src/common/common.module';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserModule } from 'src/modules/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/common/auth/services/auth.service';
import { HelperHashService } from 'src/common/auth/services/helper.hash.service';

@Module({
  imports: [
    CoreModule,
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
  providers: [PrismaService, JwtService, AuthService, HelperHashService],
})
export class AppModule {}
