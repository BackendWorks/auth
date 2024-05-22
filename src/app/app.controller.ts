import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { TransformPayload } from 'src/decorators/message.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UserService } from 'src/modules/user/services/user.service';

@Controller()
export class AppController {
  private readonly accessTokenSecret: string;

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecret = this.configService.get<string>(
      'auth.accessToken.secret',
    );
  }

  @MessagePattern('getUserById')
  public async getUserById(@TransformPayload() payload: Record<string, any>) {
    return this.userService.getUserById(payload.userId);
  }

  @MessagePattern('validateToken')
  public async getUserByAccessToken(
    @TransformPayload() payload: Record<string, any>,
  ) {
    return this.authService.verifyToken(payload.token);
  }

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.isHealthy(),
    ]);
  }
}
