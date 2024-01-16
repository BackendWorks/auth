import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [UserController],
  imports: [],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
