import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { HashService } from 'src/common/services/hash.service';
import { UserService } from 'src/modules/user/services/user.service';

import { AuthLoginDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthResponseDto, SignUpByEmailResponseDto } from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupByEmailDto } from 'src/modules/auth/dtos/auth.signup.dto';
import {
    IAuthPayload,
    ITokenResponse,
    TokenType,
} from 'src/modules/auth/interfaces/auth.interface';
import { IAuthService } from 'src/modules/auth/interfaces/auth.service.interface';
import { I18nService } from 'nestjs-i18n';
import { MailService } from 'src/common/services/mail.service';

@Injectable()
export class AuthService implements IAuthService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExp: string;
    private readonly refreshTokenExp: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly hashService: HashService,
        private readonly i18n: I18nService,
        private readonly mailService: MailService,
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

    async login(data: AuthLoginDto): Promise<AuthResponseDto> {
        try {
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
        } catch (e) {
            throw e;
        }
    }

    async signupByEmail(data: AuthSignupByEmailDto): Promise<SignUpByEmailResponseDto> {
        try {
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

            const message = this.i18n.t('success.signupSuccess');

            return {
                user: createdUser,
                message,
            };
        } catch (e) {
            throw e;
        }
    }
}
