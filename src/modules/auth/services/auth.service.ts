import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { addHours } from 'date-fns';

import { HashService } from 'src/common/services/hash.service';
import { UserService } from 'src/modules/user/services/user.service';

import { AuthLoginByEmailDto, AuthLoginByPhoneDto } from 'src/modules/auth/dtos/auth.login.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
    SignUpByEmailResponseDto,
} from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupByEmailDto, AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';
import {
    IAuthPayload,
    ITokenResponse,
    TokenType,
} from 'src/modules/auth/interfaces/auth.interface';
import { IAuthService } from 'src/modules/auth/interfaces/auth.service.interface';
import { MailService } from 'src/common/services/mail.service';
import { VerifyEmailDto } from 'src/modules/auth/dtos/auth.verify-email.dto';
import { ForgotPassword, User } from '@prisma/client';
import { v4 } from 'uuid';
import { FlashCallService } from 'src/common/services/flashCall.service';
import { VerifyPhoneDto } from 'src/modules/auth/dtos/auth.verify-phone.dto';
import {
    SendFlashCallResponseDto,
    VerifyFlashCallResponseDto,
} from 'src/common/dtos/flash-call-response.dto';
import {
    ForgotPasswordDto,
    ForgotPasswordResponseDto,
    ForgotPasswordVerifyDto,
    ResetPasswordDto,
} from 'src/modules/auth//dtos/auth.forgot-password.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { getClientIp } from 'request-ip';
import { Request } from 'express';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { ChangePhoneDto } from 'src/modules/auth/dtos/auth.change-phone.dto';
import { ChangeEmailDto } from 'src/modules/auth/dtos/auth.change-email.dto';
import { VerifyEmailChangeDto } from 'src/modules/auth/dtos/auth.verify-change-email.dto';

@Injectable()
export class AuthService implements IAuthService {
    HOURS_TO_VERIFY = 4;

    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExp: string;
    private readonly refreshTokenExp: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly hashService: HashService,
        private readonly mailService: MailService,
        private readonly callService: FlashCallService,
        private readonly prisma: PrismaService,
    ) {
        this.accessTokenSecret = this.configService.get<string>('auth.accessToken.secret');
        this.refreshTokenSecret = this.configService.get<string>('auth.refreshToken.secret');
        this.accessTokenExp = this.configService.get<string>('auth.accessToken.expirationTime');
        this.refreshTokenExp = this.configService.get<string>('auth.refreshToken.expirationTime');
    }

    async verifyToken(accessToken: string): Promise<IAuthPayload> {
        try {
            const data = await this.jwtService.verifyAsync(accessToken, {
                secret: this.accessTokenSecret,
            });

            return data;
        } catch (e) {
            throw e;
        }
    }

    async generateTokens(user: IAuthPayload): Promise<ITokenResponse> {
        const accessTokenPromise = this.jwtService.signAsync(
            {
                id: user.id,
                role: user.role,
                tokenType: TokenType.ACCESS_TOKEN,
            },
            {
                secret: this.accessTokenSecret,
                expiresIn: this.accessTokenExp,
            },
        );

        const refreshTokenPromise = this.jwtService.signAsync(
            {
                id: user.id,
                role: user.role,
                tokenType: TokenType.REFRESH_TOKEN,
            },
            {
                secret: this.refreshTokenSecret,
                expiresIn: this.refreshTokenExp,
            },
        );

        const [accessToken, refreshToken] = await Promise.all([
            accessTokenPromise,
            refreshTokenPromise,
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async loginByEmail(
        data: AuthLoginByEmailDto,
    ): Promise<AuthResponseDto & AuthRefreshResponseDto> {
        const { email, password } = data;

        const user = await this.userService.getUserByEmail(email);

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const match = this.hashService.match(user.password, password);

        if (!match) {
            throw new NotFoundException('user.invalidPassword');
        }

        const { accessToken, refreshToken } = await this.generateTokens({
            id: user.id,
            role: user.role,
        });

        return {
            accessToken,
            refreshToken,
            user,
        };
    }

    async loginByPhone(payload: AuthLoginByPhoneDto): Promise<SendFlashCallResponseDto> {
        const { phone } = payload;

        const user = await this.userService.getUserByPhone(phone);
        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const response = await this.callService.sendFlashCall({ phone });

        return response;
    }

    async changePhone(
        user: IAuthPayload,
        payload: ChangePhoneDto,
    ): Promise<SendFlashCallResponseDto> {
        const { phone } = payload;

        const existingUser = await this.userService.getUserByPhone(phone);
        if (existingUser) {
            throw new BadRequestException('user.userWithPhoneFound');
        }

        const response = await this.callService.sendFlashCall({ phone }, user.id);

        return response;
    }

    async verifyChangePhone(
        user: IAuthPayload,
        payload: VerifyPhoneDto,
    ): Promise<VerifyFlashCallResponseDto> {
        const { phone, code } = payload;

        await this.callService.verifyFlashCall({ phone, code });
        console.log(phone, code, user);

        const updatedUser = await this.userService.updateUser(user.id, {
            phoneNumber: phone,
        });

        return {
            updatedUser,
        };
    }

    async changeEmail(user: IAuthPayload, payload: ChangeEmailDto) {
        const { newEmail } = payload;

        const foundUser = await this.userService.findOne({ id: user.id });
        if (!foundUser) {
            throw new NotFoundException('user.userNotFound');
        }

        const existingEmailUser = await this.userService.getUserByEmail(newEmail);
        if (existingEmailUser) {
            throw new ConflictException('user.userExistsByEmail');
        }

        const verificationToken = v4();
        await this.userService.updateUser(foundUser.id, {
            verification: verificationToken,
            verificationExpires: addHours(new Date(), this.HOURS_TO_VERIFY),
        });

        await this.mailService.sendUserConfirmation(newEmail, verificationToken);

        return { message: 'Verification email sent to the new address.' };
    }

    async verifyChangeEmail(payload: VerifyEmailChangeDto): Promise<UserResponseDto> {
        const { verification, newEmail } = payload;

        const user = await this.userService.findOne({
            verification,
            verificationExpires: { gt: new Date() },
        });

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const existingEmailUser = await this.userService.getUserByEmail(newEmail);
        if (existingEmailUser) {
            throw new ConflictException('user.userExistsByEmail');
        }

        const updatedUser = await this.userService.updateUser(user.id, {
            email: newEmail,
            isEmailVerified: true,
            verification: v4(),
            verificationExpires: addHours(new Date(), this.HOURS_TO_VERIFY),
        });

        return plainToInstance(UserResponseDto, updatedUser);
    }

    async signupByEmail(
        data: AuthSignupByEmailDto,
    ): Promise<SignUpByEmailResponseDto & AuthRefreshResponseDto> {
        const { email, firstName, password } = data;
        const findByEmail = await this.userService.getUserByEmail(email);

        if (findByEmail) {
            throw new ConflictException('user.userExistsByEmail');
        }

        const passwordHashed = this.hashService.createHash(password);

        const createdUser = await this.userService.createUserByEmail({
            email,
            firstName: firstName?.trim(),
            password: passwordHashed,
        });

        await this.mailService.sendUserConfirmation(email, createdUser.verification);

        const tokens = await this.generateTokens({
            id: createdUser.id,
            role: createdUser.role,
        });

        return {
            ...tokens,
            user: createdUser,
        };
    }

    async signupByPhone(signupByPhoneDto: AuthSignupByPhoneDto): Promise<SendFlashCallResponseDto> {
        const { phone, firstName } = signupByPhoneDto;
        const user = await this.userService.getUserByPhone(phone);

        if (user) {
            throw new ConflictException('user.userExistsByPhone');
        }

        await this.userService.createUserByPhone({
            phone,
            firstName: firstName?.trim(),
        });

        await this.callService.sendFlashCall({ phone });

        return {
            status: 200,
            description: 'Flash call initiated successfully',
        };
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto) {
        const user = await this.findByVerification(verifyEmailDto.verification);

        const updatedUser = await this.userService.updateUser(user.id, {
            isEmailVerified: true,
            verification: v4(),
            verificationExpires: addHours(new Date(), this.HOURS_TO_VERIFY),
        });

        const tokens = await this.generateTokens({
            id: updatedUser.id,
            role: updatedUser.role,
        });

        return {
            ...tokens,
            user: updatedUser,
        };
    }

    async verifyPhone(
        verifyPhoneDto: VerifyPhoneDto,
    ): Promise<VerifyFlashCallResponseDto & AuthRefreshResponseDto> {
        const { phone, code } = verifyPhoneDto;
        const user = await this.userService.getUserByPhone(phone);

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        await this.callService.verifyFlashCall({ phone, code });

        const updatedUser = await this.userService.updateUser(user.id, {
            isPhoneVerified: true,
            verificationExpires: addHours(new Date(), this.HOURS_TO_VERIFY),
        });

        const { accessToken, refreshToken } = await this.generateTokens({
            id: user.id,
            role: user.role,
        });

        const userResponseDto = plainToInstance(UserResponseDto, updatedUser);

        return {
            accessToken,
            refreshToken,
            updatedUser: userResponseDto,
        };
    }

    async forgotPassword(
        req: Request,
        forgotPasswordDto: ForgotPasswordDto,
    ): Promise<ForgotPasswordResponseDto> {
        const { email } = forgotPasswordDto;

        const user = await this.userService.getUserByEmail(email);

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const forgotPassword = await this.prisma.forgotPassword.create({
            data: {
                email: email,
                verification: v4(),
                expires: addHours(new Date(), this.HOURS_TO_VERIFY),
                ip: this.getIp(req),
                browser: this.getBrowserInfo(req),
                country: this.getCountry(req),
            },
        });

        await this.mailService.sendPasswordReset(email, forgotPassword.verification);

        return {
            email: email,
            message: 'Verification letter sent.',
        };
    }

    async forgotPasswordVerify(req: Request, verifyUuidDto: ForgotPasswordVerifyDto) {
        const forgotPassword = await this.findForgotPasswordByVerification(verifyUuidDto);
        await this.setForgotPasswordFirstUsed(req, forgotPassword);

        return {
            email: forgotPassword.email,
            message: 'Now you can reset your password.',
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { email } = resetPasswordDto;

        const forgotPassword = await this.findForgotPasswordByEmail(resetPasswordDto);

        await this.setForgotPasswordFinalUsed(forgotPassword);
        await this.resetUserPassword(resetPasswordDto);

        return {
            email,
            message: 'Password successfully changed.',
        };
    }

    private async findByVerification(verification: string): Promise<User> {
        const user = await this.userService.findOne({
            verification,
            isEmailVerified: false,
            verificationExpires: {
                gt: new Date(),
            },
        });

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        return user;
    }

    private async findForgotPasswordByVerification(
        verification: ForgotPasswordVerifyDto,
    ): Promise<ForgotPassword> {
        const forgotPassword = await this.prisma.forgotPassword.findFirst({
            where: {
                verification: verification.verification,
                firstUsed: false,
                finalUsed: false,
                expires: {
                    gt: new Date(),
                },
            },
        });

        if (!forgotPassword) {
            throw new NotFoundException('forgotPassword.forgotPasswordNotFound');
        }

        return forgotPassword;
    }

    private async setForgotPasswordFirstUsed(req: Request, forgotPassword: ForgotPassword) {
        await this.prisma.forgotPassword.update({
            where: { id: forgotPassword.id },
            data: {
                firstUsed: true,
                ipChanged: this.getIp(req),
                browserChanged: this.getBrowserInfo(req),
                countryChanged: this.getCountry(req),
            },
        });
    }

    private async findForgotPasswordByEmail(
        resetPasswordDto: ResetPasswordDto,
    ): Promise<ForgotPassword> {
        const forgotPassword = await this.prisma.forgotPassword.findFirst({
            where: {
                email: resetPasswordDto.email,
                firstUsed: true,
                finalUsed: false,
                expires: {
                    gt: new Date(),
                },
            },
        });

        if (!forgotPassword) {
            throw new NotFoundException('forgotPassword.forgotPasswordNotFound');
        }

        return forgotPassword;
    }

    private async setForgotPasswordFinalUsed(forgotPassword: ForgotPassword) {
        await this.prisma.forgotPassword.update({
            where: { id: forgotPassword.id },
            data: {
                finalUsed: true,
            },
        });
    }

    private async resetUserPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.userService.findOne({
            email: resetPasswordDto.email,
            isEmailVerified: true,
        });

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const passwordHashed = this.hashService.createHash(resetPasswordDto.password);

        await this.userService.updateUser(user.id, {
            password: passwordHashed,
        });
    }

    getIp(req: Request): string {
        return getClientIp(req);
    }

    getBrowserInfo(req: Request): string {
        return req.headers['user-agent'] || 'XX';
    }

    getCountry(req: Request): string {
        const country = req.headers['cf-ipcountry'];
        return Array.isArray(country) ? country[0] : country || 'XX';
    }
}
