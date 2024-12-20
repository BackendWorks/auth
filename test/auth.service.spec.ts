import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

import { HashService } from 'src/common/services/hash.service';
import { AuthLoginByEmailDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthSignupByEmailDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { MailService } from '../src/common/services/mail.service';
import { I18nService } from 'nestjs-i18n';
import { FlashCallService } from '../src/common/services/flashCall.service';
import { addDays } from 'date-fns';

describe('AuthService', () => {
    let authService: AuthService;
    let flashCallService: FlashCallService;
    let jwtService: JwtService;
    let userService: UserService;
    let hashService: HashService;
    let mailService: MailService;
    let i18nService: I18nService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => {
                            switch (key) {
                                case 'auth.accessToken.secret':
                                    return 'access-secret';
                                case 'auth.refreshToken.secret':
                                    return 'refresh-secret';
                                case 'auth.accessToken.expirationTime':
                                    return '1h';
                                case 'auth.refreshToken.expirationTime':
                                    return '7d';
                                default:
                                    return null;
                            }
                        }),
                    },
                },
                { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } },
                {
                    provide: UserService,
                    useValue: { getUserByEmail: jest.fn(), createUserByEmail: jest.fn() },
                },
                { provide: HashService, useValue: { match: jest.fn(), createHash: jest.fn() } },
                {
                    provide: MailService,
                    useValue: {
                        sendUserConfirmation: jest.fn(),
                    },
                },
                {
                    provide: FlashCallService,
                    useValue: {
                        sendFlashCall: jest.fn(),
                        verifyFlashCall: jest.fn(),
                    },
                },
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn().mockImplementation((key: string) => {
                            const translations = {
                                'success.signupSuccess': 'User successfully registered',
                            };
                            return translations[key] || key;
                        }),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
        hashService = module.get<HashService>(HashService);
        mailService = module.get<MailService>(MailService);
        i18nService = module.get<I18nService>(I18nService);
        flashCallService = module.get<FlashCallService>(FlashCallService);
    });

    describe('verifyToken', () => {
        it('should verify a valid token and return decoded data', async () => {
            const mockToken = 'validToken';
            const mockPayload: IAuthPayload = { id: 'user1', role: 'user' };

            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

            const result = await authService.verifyToken(mockToken);

            expect(result).toEqual(mockPayload);
            expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
                secret: 'access-secret',
            });
        });

        it('should throw an error if token verification fails', async () => {
            const mockToken = 'invalidToken';

            jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

            await expect(authService.verifyToken(mockToken)).rejects.toThrow('Invalid token');
        });
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', async () => {
            const mockUser: IAuthPayload = { id: 'user1', role: 'user' };
            const accessToken = 'accessToken';
            const refreshToken = 'refreshToken';

            jest.spyOn(jwtService, 'signAsync')
                .mockResolvedValueOnce(accessToken)
                .mockResolvedValueOnce(refreshToken);

            const result = await authService.generateTokens(mockUser);

            expect(result).toEqual({ accessToken, refreshToken });
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
        });
    });

    describe('login', () => {
        it('should throw NotFoundException if user does not exist', async () => {
            const loginDto: AuthLoginByEmailDto = {
                email: 'test@example.com',
                password: 'password',
            };

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);

            await expect(authService.loginByEmail(loginDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if password does not match', async () => {
            const loginDto: AuthLoginByEmailDto = {
                email: 'test@example.com',
                password: 'wrongPassword',
            };
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
            } as User;

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(hashService, 'match').mockReturnValue(false);

            await expect(authService.loginByEmail(loginDto)).rejects.toThrow(NotFoundException);
        });

        it('should return user data on successful login', async () => {
            const loginDto: AuthLoginByEmailDto = {
                email: 'test@example.com',
                password: 'password',
            };
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
            } as User;
            const accessToken = 'accessToken';
            const refreshToken = 'refreshToken';

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(hashService, 'match').mockReturnValue(true);
            jest.spyOn(authService, 'generateTokens').mockResolvedValue({
                accessToken,
                refreshToken,
            });

            const result = await authService.loginByEmail(loginDto);

            expect(result).toEqual({ user: mockUser });
        });

        it('should throw an error if token generation fails', async () => {
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
            } as User;

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(hashService, 'match').mockReturnValue(true);
        });
    });

    describe('signup', () => {
        it('should throw ConflictException if email is already used', async () => {
            const signupDto: AuthSignupByEmailDto = {
                email: 'test@example.com',
                firstName: 'Test',
                password: 'password',
            };

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue({
                id: 'user1',
            } as UserResponseDto);

            await expect(authService.signupByEmail(signupDto)).rejects.toThrow(ConflictException);
        });

        it('should create a new user and return user data', async () => {
            const signupDto: AuthSignupByEmailDto = {
                email: 'new@example.com',
                firstName: 'New',
                password: 'password123',
            };
            const mockUser = {
                id: 'user1',
                email: 'new@example.com',
                password: 'hashedPassword',
                firstName: 'New',
                role: 'USER',
                blockExpires: null,
                isEmailVerified: false,
                loginAttempts: 0,
                verificationExpires: addDays(new Date(), 1),
                verification: 'mock-verification-token',
            } as User;
            const hashedPassword = 'hashedPassword';

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
            jest.spyOn(hashService, 'createHash').mockReturnValue(hashedPassword);

            const prismaCreateMock = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(userService, 'createUserByEmail').mockImplementation(async data => {
                return await prismaCreateMock({ data });
            });

            jest.spyOn(mailService, 'sendUserConfirmation').mockResolvedValue(undefined);
            jest.spyOn(i18nService, 't').mockReturnValue('User successfully registered');

            const result = await authService.signupByEmail(signupDto);

            expect(result).toEqual({
                user: mockUser,
            });
            expect(mailService.sendUserConfirmation).toHaveBeenCalledWith(
                signupDto.email,
                mockUser.verification,
            );

            expect(prismaCreateMock).toHaveBeenCalledWith({
                data: {
                    email: signupDto.email,
                    password: hashedPassword,
                    firstName: signupDto.firstName.trim(),
                },
            });
        });
    });
});
