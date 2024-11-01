import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';

import { AppController } from './app.controller';

@Module({
    imports: [TerminusModule, CommonModule, UserModule, AuthModule],
    controllers: [AppController],
})
export class AppModule {}
