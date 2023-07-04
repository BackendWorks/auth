import { Controller, Get } from '@nestjs/common';
import { Public } from './core';
import { PrismaService } from './services';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private healthCheckService: HealthCheckService,
    private prismaService: PrismaService,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.isHealthy(),
    ]);
  }
}
