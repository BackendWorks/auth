import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AdminUserController } from './controllers/user.admin.controller';

@Module({
  controllers: [UserController, AdminUserController],
  imports: [CommonModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
