import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { MessageKey } from 'src/common/decorators/message.decorator';
import { PublicRoute } from 'src/common/decorators/public.decorator';

import { AuthJwtRefreshGuard } from 'src/common/guards/jwt.refresh.guard';
import { AuthLoginDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthRefreshResponseDto, AuthResponseDto } from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { AuthService } from 'src/modules/auth/services/auth.service';

@ApiTags('public.auth')
@Controller({
    version: '1',
    path: '/auth',
})
export class AuthPublicController {
    constructor(private readonly authService: AuthService) {}

    @PublicRoute()
    @Post('login')
    @MessageKey('auth.success.login')
    public login(@Body() payload: AuthLoginDto): Promise<AuthResponseDto> {
        return this.authService.login(payload);
    }

    @PublicRoute()
    @Post('signup')
    @MessageKey('auth.success.signup')
    public signup(@Body() payload: AuthSignupDto): Promise<AuthResponseDto> {
        return this.authService.signup(payload);
    }

    @UseGuards(AuthJwtRefreshGuard)
    @PublicRoute()
    @Get('refresh')
    @MessageKey('auth.success.refresh')
    public refreshTokens(@AuthUser() user: IAuthPayload): Promise<AuthRefreshResponseDto> {
        return this.authService.generateTokens(user);
    }
}
