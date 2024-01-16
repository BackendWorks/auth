import { Module } from '@nestjs/common';
import { AuthJwtAccessStrategy } from './strategies/jwt.access.strategy';
import { AuthService } from './services/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthJwtAccessGuard } from './guards/jwt.access.guard';
import { PrismaService } from '../services/prisma.service';
import { HelperService } from './services/helper.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.accessToken.secret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'auth.accessToken.expirationTime',
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthJwtAccessStrategy,
    AuthService,
    PrismaService,
    HelperService,
    {
      provide: APP_GUARD,
      useClass: AuthJwtAccessGuard,
    },
  ],
})
export class AuthModule {}
