import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthResponseDto } from '../dtos/auth.response.dto';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto } from '../dtos/auth.login.dto';
import { AuthSignupDto } from '../dtos/auth.signup.dto';

import { PublicRoute } from '@/common/decorators/request-public.decorator';
import { MessageKey } from '@/common/decorators/message.decorator';
import { SwaggerResponse } from '@/common/dtos/base-response.dto';

@ApiTags('auth')
@Controller({
    version: '1',
    path: '/auth',
})
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @PublicRoute()
    @MessageKey('auth.success.login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User logged in successfully',
        type: SwaggerResponse(AuthResponseDto),
    })
    async login(@Body() payload: AuthLoginDto): Promise<AuthResponseDto> {
        return this.authService.login(payload);
    }

    @Post('signup')
    @PublicRoute()
    @MessageKey('auth.success.signup')
    @ApiOperation({ summary: 'User registration' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User registered successfully',
        type: SwaggerResponse(AuthResponseDto),
    })
    async signup(@Body() payload: AuthSignupDto): Promise<AuthResponseDto> {
        return this.authService.signup(payload);
    }
}
