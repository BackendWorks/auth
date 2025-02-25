import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { UserModule } from '../modules/user/user.module';
import { AppController } from './app.controller';

@Module({
    imports: [CommonModule, DatabaseModule, UserModule, TerminusModule],
    controllers: [AppController],
})
export class AppModule {}
