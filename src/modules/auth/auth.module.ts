import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/services/user.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthJwtAccessStrategy } from './strategies/jwt.access.strategy';
import { AuthKafkaController } from './controllers/auth.kafka.controller';

import { DatabaseModule } from '@/database/database.module';

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({
            session: false,
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('auth.accessToken.secret'),
                signOptions: {
                    expiresIn: config.get<string>(
                        'auth.accessToken.expirationTime',
                    ),
                },
            }),
        }),
    ],
    controllers: [AuthController, AuthKafkaController],
    providers: [AuthJwtAccessStrategy, AuthService, UserService],
    exports: [AuthJwtAccessStrategy, AuthService],
})
export class AuthModule {}
