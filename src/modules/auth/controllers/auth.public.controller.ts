import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthUser } from 'src/common/decorators/auth.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthJwtRefreshGuard } from 'src/common/guards/jwt.refresh.guard';

import { AuthLoginByEmailDto, AuthLoginByPhoneDto } from 'src/modules/auth/dtos/auth.login.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
    SignUpByEmailResponseDto,
    VerifyEmailResponseDto,
} from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupByEmailDto, AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { VerifyEmailDto } from 'src/modules/auth/dtos/auth.verify-email.dto';
import { VerifyPhoneDto } from 'src/modules/auth/dtos/auth.verify-phone.dto';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { AuthService } from 'src/modules/auth/services/auth.service';

import {
    SendFlashCallResponseDto,
    VerifyFlashCallResponseDto,
} from 'src/common/dtos/flash-call-response.dto';

import {
    ForgotPasswordDto,
    ForgotPasswordResponseDto,
    ForgotPasswordVerifyDto,
    ForgotPasswordVerifyResponseDto,
    ResetPasswordDto,
} from 'src/modules/auth/dtos/auth.forgot-password.dto';

import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ChangePhoneDto } from 'src/modules/auth/dtos/auth.change-phone.dto';
import { VerifyEmailChangeDto } from 'src/modules/auth/dtos/auth.verify-change-email.dto';
import { ChangeEmailDto } from 'src/modules/auth/dtos/auth.change-email.dto';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';

@ApiTags('public.auth')
@Controller({
    version: '1',
    path: '/auth',
})
export class PublicAuthController {
    private readonly env: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.env = this.configService.get<string>('app.env');
    }

    @Public()
    @Post('login/email')
    @HttpCode(HttpStatus.OK)
    public async loginByEmail(
        @Body() authLoginByEmailDto: AuthLoginByEmailDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AuthResponseDto> {
        const authResponse = await this.authService.loginByEmail(authLoginByEmailDto);

        response.cookie('accessToken', authResponse.accessToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 3,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        response.cookie('refreshToken', authResponse.refreshToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        const { accessToken, refreshToken, ...rest } = authResponse;
        return rest;
    }

    @Public()
    @Post('login/phone')
    public loginByPhone(@Body() payload: AuthLoginByPhoneDto): Promise<SendFlashCallResponseDto> {
        return this.authService.loginByPhone(payload);
    }

    @Public()
    @Post('signup/email')
    @HttpCode(HttpStatus.CREATED)
    public async signupByEmail(
        @Body() authSignupByEmailDto: AuthSignupByEmailDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<SignUpByEmailResponseDto> {
        const signUpResponse = await this.authService.signupByEmail(authSignupByEmailDto);

        response.cookie('accessToken', signUpResponse.accessToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 3,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        response.cookie('refreshToken', signUpResponse.refreshToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        const { accessToken, refreshToken, ...rest } = signUpResponse;
        return rest;
    }

    @Public()
    @Post('signup/phone')
    @HttpCode(HttpStatus.CREATED)
    public signupByPhone(@Body() payload: AuthSignupByPhoneDto): Promise<SendFlashCallResponseDto> {
        return this.authService.signupByPhone(payload);
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    public verifyEmail(@Body() payload: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
        return this.authService.verifyEmail(payload);
    }

    @Public()
    @Post('verify-phone')
    @HttpCode(HttpStatus.OK)
    public async verifyPhone(
        @Body() verifyPhoneDto: VerifyPhoneDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<VerifyFlashCallResponseDto> {
        const verifyResponse = await this.authService.verifyPhone(verifyPhoneDto);

        response.cookie('accessToken', verifyResponse.accessToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 3,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        response.cookie('refreshToken', verifyResponse.refreshToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        const { accessToken, refreshToken, ...rest } = verifyResponse;
        return rest;
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    public forgotPassword(
        @Req() req: Request,
        @Body() payload: ForgotPasswordDto,
    ): Promise<ForgotPasswordResponseDto> {
        return this.authService.forgotPassword(req, payload);
    }

    @Public()
    @Post('forgot-password-verify')
    @HttpCode(HttpStatus.OK)
    public forgotPasswordVerify(
        @Req() req: Request,
        @Body() payload: ForgotPasswordVerifyDto,
    ): Promise<ForgotPasswordVerifyResponseDto> {
        return this.authService.forgotPasswordVerify(req, payload);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    public resetPassword(
        @Body() payload: ResetPasswordDto,
    ): Promise<ForgotPasswordVerifyResponseDto> {
        return this.authService.resetPassword(payload);
    }

    @Public()
    @Delete('logout')
    @HttpCode(HttpStatus.OK)
    public async logout(
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ message: string }> {
        response.cookie('accessToken', '', {
            httpOnly: true,
            secure: this.env === 'production',
            expires: new Date(0),
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        response.cookie('refreshToken', '', {
            httpOnly: true,
            secure: this.env === 'production',
            expires: new Date(0),
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        return { message: 'Successfully logged out' };
    }

    @Public()
    @UseGuards(AuthJwtRefreshGuard)
    @Get('refresh')
    @HttpCode(HttpStatus.OK)
    public async refreshTokens(
        @AuthUser() user: IAuthPayload,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AuthRefreshResponseDto> {
        const refreshResponse = await this.authService.generateTokens(user);

        response.cookie('accessToken', refreshResponse.accessToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 3,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        response.cookie('refreshToken', refreshResponse.refreshToken, {
            httpOnly: true,
            secure: this.env === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: this.env === 'production' ? 'none' : 'lax',
            domain: this.env === 'production' ? '.fishstat.ru' : undefined,
        });

        return refreshResponse;
    }

    // ----------------------------
    // Protected endpoints below
    // ----------------------------

    @Post('change/phone')
    @ApiBearerAuth('accessToken')
    public changePhone(
        @AuthUser() user: IAuthPayload,
        @Body() payload: ChangePhoneDto,
    ): Promise<SendFlashCallResponseDto> {
        return this.authService.changePhone(user, payload);
    }

    @Post('change/email')
    @ApiBearerAuth('accessToken')
    public async changeEmail(
        @AuthUser() user: IAuthPayload,
        @Body() payload: ChangeEmailDto,
    ): Promise<{ message: string }> {
        return this.authService.changeEmail(user, payload);
    }

    @Post('verify-change/email')
    @ApiBearerAuth('accessToken')
    @HttpCode(HttpStatus.OK)
    public async verifyChangeEmail(
        @Body() payload: VerifyEmailChangeDto,
    ): Promise<UserResponseDto> {
        return this.authService.verifyChangeEmail(payload);
    }

    @Post('verify-change/phone')
    @ApiBearerAuth('accessToken')
    @HttpCode(HttpStatus.OK)
    public async verifyChangePhone(
        @AuthUser() user: IAuthPayload,
        @Body() payload: VerifyPhoneDto,
    ): Promise<VerifyFlashCallResponseDto> {
        return this.authService.verifyChangePhone(user, payload);
    }
}
