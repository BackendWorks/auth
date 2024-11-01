import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { TransformMessagePayload } from 'src/common/decorators/payload.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PrismaService } from 'src/common/services/prisma.service';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UserService } from 'src/modules/user/services/user.service';

@Controller({
    version: VERSION_NEUTRAL,
    path: '/',
})
export class AppController {
    constructor(
        private readonly healthCheckService: HealthCheckService,
        private readonly prismaService: PrismaService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Get('/health')
    @HealthCheck()
    @Public()
    public async getHealth() {
        return this.healthCheckService.check([() => this.prismaService.isHealthy()]);
    }

    @MessagePattern('validateToken')
    public async getUserByAccessToken(@TransformMessagePayload() payload: Record<string, string>) {
        return this.authService.verifyToken(payload.token);
    }

    @MessagePattern('getUserById')
    public async getUserById(@TransformMessagePayload() payload: Record<string, string>) {
        return this.userService.getUserById(payload.userId);
    }

    @MessagePattern('getUserByEmail')
    public async getUserByEmail(@TransformMessagePayload() payload: Record<string, string>) {
        return this.userService.getUserByEmail(payload.userName);
    }
}
