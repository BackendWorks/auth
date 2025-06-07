import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PublicRoute } from 'src/common/decorators/public.decorator';

import { DatabaseService } from 'src/common/services/database.service';

@Controller({
    version: VERSION_NEUTRAL,
    path: '/',
})
export class AppController {
    constructor(
        private readonly healthCheckService: HealthCheckService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get('/health')
    @HealthCheck()
    @PublicRoute()
    public async getHealth() {
        return this.healthCheckService.check([() => this.databaseService.isHealthy()]);
    }
}
