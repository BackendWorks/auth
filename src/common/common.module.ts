import configs from '../config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './services/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthModule } from './congnito-auth/cognito.auth.module';

@Module({
  controllers: [],
  imports: [
    AuthModule,
    CognitoAuthModule,
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
  providers: [PrismaService],
})
export class CommonModule {}
