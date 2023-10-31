import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  controllers: [AuthController, UserController],
  imports: [],
  providers: [UserService],
})
export class UserModule {}
