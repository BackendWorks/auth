import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CommonModule } from 'src/common/common.module';
import { UserService } from 'src/modules/user/services/user.service';

import { PublicAuthController } from './controllers/auth.public.controller';
import { AuthService } from './services/auth.service';

@Module({
    imports: [
        CommonModule,
        PassportModule.register({
            session: false,
        }),
        JwtModule.register({}),
    ],
    controllers: [PublicAuthController],
    providers: [AuthService, UserService],
    exports: [AuthService],
})
export class AuthModule {}
