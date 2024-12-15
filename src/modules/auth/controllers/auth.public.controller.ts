import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthUser } from 'src/common/decorators/auth.decorator';
import { Public } from 'src/common/decorators/public.decorator';

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
export class PublicAuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    public login(@Body() payload: AuthLoginDto): Promise<AuthResponseDto> {
        return this.authService.login(payload);
    }

    @Public()
    @Post('signup')
    public signup(@Body() payload: AuthSignupDto): Promise<AuthResponseDto> {
        return this.authService.signup(payload);
    }

    @Public()
    @UseGuards(AuthJwtRefreshGuard)
    @Get('refresh')
    public refreshTokens(@AuthUser() user: IAuthPayload): Promise<AuthRefreshResponseDto> {
        return this.authService.generateTokens(user);
    }

    @Public()
    @Get('test')
    public test(): string {
        return 'This is a test string';
    }
}
