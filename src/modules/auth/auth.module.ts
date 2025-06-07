import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CommonModule } from 'src/common/common.module';
import { AuthPublicController } from './controllers/auth.public.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { AuthGrpcController } from './controllers/auth.grpc.controller';

@Module({
    imports: [
        CommonModule,
        PassportModule.register({ session: false }),
        JwtModule.register({}),
        UserModule,
    ],
    controllers: [AuthPublicController, AuthGrpcController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
