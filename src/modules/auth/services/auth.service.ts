import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/modules/user/services/user.service';

import {
    IAuthPayload,
    ITokenResponse,
    TokenType,
} from '../interfaces/auth.interface';
import { IAuthService } from '../interfaces/auth.service.interface';
import { AuthResponseDto } from '../dtos/auth.response.dto';
import { AuthLoginDto } from '../dtos/auth.login.dto';
import { AuthSignupDto } from '../dtos/auth.signup.dto';

@Injectable()
export class AuthService implements IAuthService {
    private readonly accessTokenSecret: string;
    private readonly accessTokenExp: string;
    private readonly salt: string;
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {
        this.salt = bcrypt.genSaltSync();
        this.accessTokenSecret = this.configService.get<string>(
            'auth.accessToken.secret',
        );
        this.accessTokenExp = this.configService.get<string>(
            'auth.accessToken.expirationTime',
        );
        this.logger.log('AuthService initialized');
    }

    public createHash(password: string): string {
        return bcrypt.hashSync(password, this.salt);
    }

    public match(hash: string, password: string): boolean {
        return bcrypt.compareSync(password, hash);
    }

    async verifyToken(accessToken: string): Promise<IAuthPayload> {
        try {
            const data = await this.jwtService.verifyAsync(accessToken, {
                secret: this.accessTokenSecret,
            });
            this.logger.debug(`Token verified for user ID: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error(`Token verification failed: ${error.message}`);
            throw error;
        }
    }

    async generateToken(user: IAuthPayload): Promise<ITokenResponse> {
        try {
            this.logger.debug(`Generating token for user ID: ${user.id}`);
            const accessToken = await this.jwtService.signAsync(
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

            return {
                accessToken,
            };
        } catch (error) {
            this.logger.error(`Token generation failed: ${error.message}`);
            throw error;
        }
    }

    async login(data: AuthLoginDto): Promise<AuthResponseDto> {
        try {
            const { email } = data;
            this.logger.log(`Login attempt for: ${email}`);

            const user = await this.userService.getUserByEmail(email);

            if (!user) {
                this.logger.warn(`Login failed: User not found - ${email}`);
                throw new NotFoundException('user.error.notFound');
            }

            const match = await this.match(user.password, data.password);

            if (!match) {
                this.logger.warn(`Login failed: Invalid password - ${email}`);
                throw new NotFoundException('user.error.invalidPassword');
            }

            const { accessToken } = await this.generateToken({
                id: user.id,
                role: user.role,
            });

            this.logger.log(`User logged in successfully: ${email}`);

            return {
                accessToken,
                user,
            };
        } catch (error) {
            this.logger.error(`Login error: ${error.message}`);
            throw error;
        }
    }

    async signup(data: AuthSignupDto): Promise<AuthResponseDto> {
        try {
            const { email, username } = data;
            this.logger.log(`Signup attempt for: ${email}`);

            const findByEmail = await this.userService.getUserByEmail(email);
            const findByUserName =
                await this.userService.getUserByUserName(username);

            if (findByEmail) {
                this.logger.warn(
                    `Signup failed: Email already exists - ${email}`,
                );
                throw new ConflictException('user.error.exists');
            }

            if (findByUserName) {
                this.logger.warn(
                    `Signup failed: Username already exists - ${username}`,
                );
                throw new ConflictException('user.error.usernameExists');
            }

            const passwordHashed = this.createHash(data.password);

            const createdUser = await this.userService.createUser({
                email,
                firstName: data.firstName?.trim(),
                lastName: data.lastName?.trim(),
                password: passwordHashed,
                username: username?.trim(),
            });

            const { accessToken } = await this.generateToken({
                id: createdUser.id,
                role: createdUser.role,
            });

            this.logger.log(`User created successfully: ${email}`);

            return {
                accessToken,
                user: createdUser,
            };
        } catch (error) {
            this.logger.error(`Signup error: ${error.message}`);
            throw error;
        }
    }
}
