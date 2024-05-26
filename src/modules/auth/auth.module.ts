import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthController } from './controllers/auth.controller';
import { HelperHashService } from './services/helper.hash.service';
import { UserService } from 'src/modules/user/services/user.service';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtAccessStrategy } from 'src/strategies/jwt.access.strategy';
import { AuthJwtRefreshStrategy } from 'src/strategies/jwt.refresh.strategy';

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
  ],
  exports: [AuthService, HelperHashService],
})
export class AuthModule {}
