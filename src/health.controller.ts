import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from './services';

@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.$queryRaw`SELECT 1`,
    ]);
  }
}
