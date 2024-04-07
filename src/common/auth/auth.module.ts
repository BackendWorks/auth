import { Module } from '@nestjs/common';
import { AuthJwtAccessStrategy } from './strategies/jwt.access.strategy';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthJwtAccessGuard } from './guards/jwt.access.guard';
import { PrismaService } from '../services/prisma.service';
import { AuthController } from './controllers/auth.controller';
import { AuthJwtRefreshStrategy } from './strategies/jwt.refresh.strategy';
import { HelperHashService } from './services/helper.hash.service';
import { UserService } from 'src/modules/user/services/user.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthJwtAccessStrategy,
    AuthJwtRefreshStrategy,
    AuthService,
    HelperHashService,
    UserService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthJwtAccessGuard,
    },
  ],
  exports: [AuthService, HelperHashService],
})
export class AuthModule {}
