import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';

import { AdminUserController } from './controllers/user.admin.controller';
import { AuthUserController } from './controllers/user.auth.controller';
import { UserService } from './services/user.service';

@Module({
    controllers: [AuthUserController, AdminUserController],
    imports: [CommonModule],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
