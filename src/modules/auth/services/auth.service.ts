import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { addHours } from 'date-fns';

import { HashService } from 'src/common/services/hash.service';
import { UserService } from 'src/modules/user/services/user.service';

import { AuthLoginByEmailDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthResponseDto, SignUpByEmailResponseDto } from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupByEmailDto, AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';
import {
    IAuthPayload,
    ITokenResponse,
    TokenType,
} from 'src/modules/auth/interfaces/auth.interface';
import { IAuthService } from 'src/modules/auth/interfaces/auth.service.interface';
import { MailService } from 'src/common/services/mail.service';
import { VerifyEmailDto } from 'src/modules/auth//dtos/auth.verify-email.dto';
import { User } from '@prisma/client';
import { v4 } from 'uuid';
import { FlashCallService } from 'src/common/services/flashCall.service';
import { VerifyPhoneDto } from 'src/modules/auth/dtos/auth.verify-phone.dto';
import { SendFlashCallResponseDto } from 'src/common/dtos/flash-call-response.dto';

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

    async loginByEmail(data: AuthLoginByEmailDto): Promise<AuthResponseDto> {
        const { email, password } = data;

        const user = await this.userService.getUserByEmail(email);

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const match = this.hashService.match(user.password, password);

        if (!match) {
            throw new NotFoundException('user.invalidPassword');
        }

        return {
            user,
        };
    }

    async signupByEmail(data: AuthSignupByEmailDto): Promise<SignUpByEmailResponseDto> {
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

        return {
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

        return {
            user: updatedUser,
        };
    }

    async verifyPhone(verifyPhoneDto: VerifyPhoneDto) {
        const { phone, code } = verifyPhoneDto;
        const user = await this.userService.getUserByPhone(phone);

        await this.callService.verifyFlashCall({ phone, code });

        await this.userService.updateUser(user.id, {
            verificationExpires: addHours(new Date(), this.HOURS_TO_VERIFY),
        });

        return {
            status: 200,
            description: 'Flash call initiated successfully',
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
}
