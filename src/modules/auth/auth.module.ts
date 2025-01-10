import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CommonModule } from 'auth/src/common/common.module';
import { UserService } from 'auth/src/modules/user/services/user.service';

import { PublicAuthController } from './controllers/auth.public.controller';
import { AuthService } from './services/auth.service';
import { FlashCallService } from 'auth/src/common/services/flashCall.service';
import { CallFactory } from 'auth/src/modules/call/call.factory';
import { ZvonokService } from 'auth/src/common/services/zvonok.service';

@Module({
    imports: [
        CommonModule,
        PassportModule.register({
            session: false,
        }),
        JwtModule.register({}),
    ],
    controllers: [PublicAuthController],
    providers: [AuthService, UserService, FlashCallService, CallFactory, ZvonokService],
    exports: [AuthService],
})
export class AuthModule {}
