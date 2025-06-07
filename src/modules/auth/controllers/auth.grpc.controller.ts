import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { ValidateTokenRequest, ValidateTokenResponse } from 'src/generated/auth';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'ValidateUser')
  async createUser(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    if (data.token) {
      const response = await this.authService.verifyToken(data.token);
      return {
        success: !!response,
        payload: {
          id: response?.id,
          role: response?.role,
        }
      }
    } else {
      return {
        success: false,
      }
    }
  }
}