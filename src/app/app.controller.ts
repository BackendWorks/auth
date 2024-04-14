import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { PrismaService } from 'src/core/services/prisma.service';
import { TransformPayload } from 'src/core/decorators/message.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { UserService } from 'src/modules/user/services/user.service';
import { GetUserByIdCallDto, ValidateTokenCallDto } from './app.interfaces';

@Controller()
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @MessagePattern('getUserByIdCall')
  public async getUserById(@TransformPayload() payload: GetUserByIdCallDto) {
    return this.userService.getUserById(payload.id);
  }

  @MessagePattern('validateTokenCall')
  public async getUserByAccessToken(
    @TransformPayload() payload: ValidateTokenCallDto,
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
