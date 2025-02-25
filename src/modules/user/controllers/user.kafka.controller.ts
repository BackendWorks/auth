import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from '../services/user.service';

@Controller()
export class UserKafkaController {
    private readonly logger = new Logger(UserKafkaController.name);

    constructor(private readonly userService: UserService) {}

    @MessagePattern('auth.user.get')
    async validateToken(@Payload() userId: string) {
        this.logger.debug(`Received fetch request for user: ${userId}`);

        try {
            const payload = await this.userService.getUserById(userId);
            return { success: true, payload };
        } catch (error) {
            this.logger.error(`Fetch failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}
