import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/services/user.service';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtAccessStrategy } from 'src/modules/auth/strategies/jwt.access.strategy';
import { AuthJwtRefreshStrategy } from 'src/modules/auth/strategies/jwt.refresh.strategy';
import { CommonModule } from 'src/common/common.module';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    CommonModule,
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
    UserService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
