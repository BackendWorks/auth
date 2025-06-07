import { AuthService } from '../services/auth.service';
import { ValidateTokenRequest, ValidateTokenResponse } from 'src/generated/auth';
import { GrpcController, GrpcMethod } from 'nestjs-grpc';
import { Controller } from '@nestjs/common';

@Controller()
@GrpcController('AuthService')
export class AuthGrpcController {
    constructor(private readonly authService: AuthService) {}

    @GrpcMethod('ValidateToken')
    async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
        if (!data.token) {
            return { success: false };
        }

        try {
            const response = await this.authService.verifyToken(data.token);
            return {
                success: true,
                payload: {
                    id: response.id,
                    role: response.role,
                },
            };
        } catch {
            return { success: false };
        }
    }
}
