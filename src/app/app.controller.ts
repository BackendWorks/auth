import { Controller, Get, Logger, VERSION_NEUTRAL } from '@nestjs/common';
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
    private readonly logger = new Logger(AppController.name);

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
        this.logger.log(`Validating token for payload: ${JSON.stringify(payload)}`);
        try {
            const result = await this.authService.verifyToken(payload.token);
            this.logger.log(`Token validated successfully: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            this.logger.error('Token validation failed', error.stack);
            throw new Error('Failed to validate token');
        }
    }

    @MessagePattern('getUserById')
    public async getUserById(@TransformMessagePayload() payload: Record<string, string>) {
        this.logger.log(`Fetching user by ID: ${payload.userId}`);
        try {
            const user = await this.userService.getUserById(payload.userId);
            this.logger.log(`Successfully fetched user: ${JSON.stringify(user)}`);
            return user;
        } catch (error) {
            this.logger.error(`Error fetching user by ID: ${payload.userId}`, error.stack);
            throw new Error('Failed to fetch user by ID');
        }
    }

    @MessagePattern('getUserByEmail')
    public async getUserByEmail(@TransformMessagePayload() payload: Record<string, string>) {
        this.logger.log(`Fetching user by email: ${payload.userName}`);
        try {
            const user = await this.userService.getUserByEmail(payload.userName);
            this.logger.log(`Successfully fetched user: ${JSON.stringify(user)}`);
            return user;
        } catch (error) {
            this.logger.error(`Error fetching user by email: ${payload.userName}`, error.stack);
            throw new Error('Failed to fetch user by email');
        }
    }
}
