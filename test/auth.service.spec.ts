import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

import { HashService } from 'src/common/services/hash.service';
import { AuthLoginDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { UserService } from 'src/modules/user/services/user.service';

describe('AuthService', () => {
    let authService: AuthService;
    let jwtService: JwtService;
    let userService: UserService;
    let hashService: HashService;

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
                    useValue: { getUserByEmail: jest.fn(), createUser: jest.fn() },
                },
                { provide: HashService, useValue: { match: jest.fn(), createHash: jest.fn() } },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
        hashService = module.get<HashService>(HashService);
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
            const loginDto: AuthLoginDto = { email: 'test@example.com', password: 'password' };

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);

            await expect(authService.login(loginDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if password does not match', async () => {
            const loginDto: AuthLoginDto = { email: 'test@example.com', password: 'wrongPassword' };
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
            } as User;

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(hashService, 'match').mockReturnValue(false);

            await expect(authService.login(loginDto)).rejects.toThrow(NotFoundException);
        });

        it('should return tokens and user data on successful login', async () => {
            const loginDto: AuthLoginDto = { email: 'test@example.com', password: 'password' };
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

            const result = await authService.login(loginDto);

            expect(result).toEqual({ accessToken, refreshToken, user: mockUser });
        });

        it('should throw an error if token generation fails', async () => {
            const loginDto: AuthLoginDto = { email: 'test@example.com', password: 'password' };
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
            } as User;

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
            jest.spyOn(hashService, 'match').mockReturnValue(true);
            jest.spyOn(authService, 'generateTokens').mockRejectedValue(
                new Error('Token generation failed'),
            );

            await expect(authService.login(loginDto)).rejects.toThrow('Token generation failed');
        });
    });

    describe('signup', () => {
        it('should throw ConflictException if email is already used', async () => {
            const signupDto: AuthSignupDto = {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                password: 'password',
            };

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue({
                id: 'user1',
            } as UserResponseDto);

            await expect(authService.signup(signupDto)).rejects.toThrow(ConflictException);
        });

        it('should create a new user and return tokens and user data', async () => {
            const signupDto: AuthSignupDto = {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                password: 'password',
            };
            const mockUser = { id: 'user1', email: 'test@example.com', role: 'USER' } as User;
            const accessToken = 'accessToken';
            const refreshToken = 'refreshToken';
            const hashedPassword = 'hashedPassword';

            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
            jest.spyOn(hashService, 'createHash').mockReturnValue(hashedPassword);
            jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);
            jest.spyOn(authService, 'generateTokens').mockResolvedValue({
                accessToken,
                refreshToken,
            });

            const result = await authService.signup(signupDto);

            expect(result).toEqual({ accessToken, refreshToken, user: mockUser });
        });
    });
});
