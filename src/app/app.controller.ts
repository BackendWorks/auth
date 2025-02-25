import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PublicRoute } from 'src/common/decorators/request-public.decorator';
import { DatabaseService } from 'src/database/database.service';

@ApiTags('health')
@Controller({
    version: VERSION_NEUTRAL,
    path: '/health',
})
export class AppController {
    constructor(
        private readonly healthCheckService: HealthCheckService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @HealthCheck()
    @PublicRoute()
    @ApiOperation({
        summary: 'Check application health',
        description: 'Returns the health status of the application',
    })
    public async getHealth() {
        return this.healthCheckService.check([
            () => this.databaseService.isHealthy(),
        ]);
    }
}
