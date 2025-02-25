import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from '../services/auth.service';

@Controller()
export class AuthKafkaController {
    private readonly logger = new Logger(AuthKafkaController.name);

    constructor(private readonly authService: AuthService) {}

    @MessagePattern('auth.token.validate')
    async validateToken(@Payload() token: string) {
        this.logger.debug(
            `Received token validation request for token: ${token}`,
        );

        try {
            const payload = await this.authService.verifyToken(token);
            this.logger.debug('Token validation successful', payload);
            return { success: true, payload };
        } catch (error) {
            this.logger.error(`Token validation failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}
