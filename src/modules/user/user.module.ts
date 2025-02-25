import { Module } from '@nestjs/common';

import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserKafkaController } from './controllers/user.kafka.controller';

import { DatabaseModule } from '@/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [UserController, UserKafkaController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
