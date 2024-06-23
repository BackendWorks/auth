import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configs from '../config';
import { PrismaService } from './services/prisma.service';
import { HelperHashService } from './services/helper.hash.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
  providers: [PrismaService, HelperHashService],
  exports: [PrismaService, HelperHashService],
})
export class CommonModule {}
