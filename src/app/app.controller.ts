import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from 'src/common/services/prisma.service';
import { Public } from 'src/core/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaService: PrismaService,
  ) {}

  // @MessagePattern('getUserById')
  // public async getUserById(@Payload() data: string): Promise<User> {
  //   const payload = JSON.parse(data);
  //   return this.authService.getUserById(payload.id);
  // }

  // @MessagePattern('validateToken')
  // public async getUserByAccessToken(@Payload() token: string) {
  //   return this.jwtService.validateToken(token);
  // }

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.isHealthy(),
    ]);
  }
}
