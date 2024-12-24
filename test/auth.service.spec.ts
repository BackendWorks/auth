import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';
import { HashService } from 'src/common/services/hash.service';
import { MailService } from 'src/common/services/mail.service';
import { FlashCallService } from 'src/common/services/flashCall.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { AuthLoginByEmailDto, AuthLoginByPhoneDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthSignupByEmailDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { VerifyEmailDto } from 'src/modules/auth/dtos/auth.verify-email.dto';
import { VerifyPhoneDto } from 'src/modules/auth/dtos/auth.verify-phone.dto';
import {
    ForgotPasswordDto,
    ForgotPasswordVerifyDto,
    ResetPasswordDto,
} from 'src/modules/auth/dtos/auth.forgot-password.dto';
import { User, ForgotPassword } from '@prisma/client';
import { v4 } from 'uuid';
import { addHours } from 'date-fns';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../src/modules/user/dtos/user.response.dto';
import { createMockUser } from './helpers/user.helper';
import { SendFlashCallResponseDto } from '../src/common/dtos/flash-call-response.dto';

jest.mock('request-ip', () => ({
    getClientIp: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let jwtService: JwtService;
    let userService: UserService;
    let hashService: HashService;
    let mailService: MailService;
    let i18nService: I18nService;
    let prismaService: PrismaService;
    let callService: FlashCallService;

    const prismaServiceMock = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            updateMany: jest.fn(),
            findOne: jest.fn(),
        },
        forgotPassword: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    const userServiceMock = {
        getUserByEmail: jest.fn(),
        createUserByEmail: jest.fn(),
        updateUser: jest.fn(),
        getUserByPhone: jest.fn(),
        createUserByPhone: jest.fn(),
        findOne: jest.fn(),
    };

    const hashServiceMock = {
        match: jest.fn(),
        createHash: jest.fn(),
    };

    const mailServiceMock = {
        sendUserConfirmation: jest.fn(),
        sendPasswordReset: jest.fn(),
    };

    const callServiceMock = {
        sendFlashCall: jest.fn(),
        verifyFlashCall: jest.fn(),
    };

    const jwtServiceMock = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };

    const configServiceMock = {
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
    };

    const i18nServiceMock = {
        t: jest.fn().mockImplementation((key: string) => {
            const translations = {
                'success.signupSuccess': 'User successfully registered',
                'user.userNotFound': 'User not found',
                'user.invalidPassword': 'Invalid password',
                'user.userExistsByEmail': 'User already exists with this email',
                'user.userExistsByPhone': 'User already exists with this phone',
                'forgotPassword.forgotPasswordNotFound': 'Forgot password request not found',
            };
            return translations[key] || key;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
                {
                    provide: UserService,
                    useValue: userServiceMock,
                },
                {
                    provide: HashService,
                    useValue: hashServiceMock,
                },
                {
                    provide: MailService,
                    useValue: mailServiceMock,
                },
                {
                    provide: FlashCallService,
                    useValue: callServiceMock,
                },
                {
                    provide: I18nService,
                    useValue: i18nServiceMock,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
        hashService = module.get<HashService>(HashService);
        mailService = module.get<MailService>(MailService);
        i18nService = module.get<I18nService>(I18nService);
        prismaService = module.get<PrismaService>(PrismaService);
        callService = module.get<FlashCallService>(FlashCallService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const baseUser = createMockUser();

    const createForgotPasswordMock = (overrides?: Partial<ForgotPassword>): ForgotPassword => ({
        id: 'forgot-id',
        email: 'user@example.com',
        verification: v4(),
        expires: addHours(new Date(), 4),
        ip: '127.0.0.1',
        browser: 'TestBrowser',
        country: 'US',
        firstUsed: false,
        finalUsed: false,
        ipChanged: '127.0.0.1',
        browserChanged: 'TestBrowser',
        countryChanged: 'US',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });

    describe('loginByEmail', () => {
        it('should login successfully with valid credentials', async () => {
            const dto: AuthLoginByEmailDto = { email: 'user@example.com', password: 'password123' };
            userServiceMock.getUserByEmail.mockResolvedValue(baseUser);
            hashServiceMock.match.mockReturnValue(true);

            const result = await authService.loginByEmail(dto);

            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
            expect(hashServiceMock.match).toHaveBeenCalledWith(baseUser.password, dto.password);
            expect(result).toEqual({ user: baseUser });
        });

        it('should throw NotFoundException if user not found', async () => {
            const dto: AuthLoginByEmailDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };
            userServiceMock.getUserByEmail.mockResolvedValue(null);

            await expect(authService.loginByEmail(dto)).rejects.toThrow(NotFoundException);
            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
        });

        it('should throw NotFoundException if password does not match', async () => {
            const dto: AuthLoginByEmailDto = {
                email: 'user@example.com',
                password: 'wrongpassword',
            };
            userServiceMock.getUserByEmail.mockResolvedValue(baseUser);
            hashServiceMock.match.mockReturnValue(false);

            await expect(authService.loginByEmail(dto)).rejects.toThrow(NotFoundException);
            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
            expect(hashServiceMock.match).toHaveBeenCalledWith(baseUser.password, dto.password);
        });
    });

    describe('loginByPhone', () => {
        it('should successfully initiate a flash call for an existing user', async () => {
            const dto: AuthLoginByPhoneDto = { phone: '+1234567890' };
            const user: User = { ...baseUser, phoneNumber: dto.phone };
            const flashCallResponse: SendFlashCallResponseDto = {
                status: 200,
                description: 'Flash call initiated successfully',
            };

            userServiceMock.getUserByPhone.mockResolvedValue(user);

            callServiceMock.sendFlashCall.mockResolvedValue(flashCallResponse);

            const result = await authService.loginByPhone(dto);

            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
            expect(callServiceMock.sendFlashCall).toHaveBeenCalledWith({ phone: dto.phone });
            expect(result).toEqual(flashCallResponse);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            const dto: AuthLoginByPhoneDto = { phone: '+0987654321' };
            userServiceMock.getUserByPhone.mockResolvedValue(null);

            await expect(authService.loginByPhone(dto)).rejects.toThrow(NotFoundException);
            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
            expect(callServiceMock.sendFlashCall).not.toHaveBeenCalled();
        });

        it('should propagate exceptions thrown by sendFlashCall', async () => {
            const dto: AuthLoginByPhoneDto = { phone: '+1234567890' };
            const user: User = { ...baseUser, phoneNumber: dto.phone };
            const errorMessage = 'Flash call service failure';

            userServiceMock.getUserByPhone.mockResolvedValue(user);
            callServiceMock.sendFlashCall.mockRejectedValue(new BadRequestException(errorMessage));

            // Act & Assert
            await expect(authService.loginByPhone(dto)).rejects.toThrow(BadRequestException);
            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
            expect(callServiceMock.sendFlashCall).toHaveBeenCalledWith({ phone: dto.phone });
            expect(userServiceMock.updateUser).not.toHaveBeenCalled();
            expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
        });
    });

    describe('signupByEmail', () => {
        it('should signup successfully with valid data', async () => {
            const dto: AuthSignupByEmailDto = {
                email: 'newuser@example.com',
                firstName: 'New',
                password: 'password123',
            };
            userServiceMock.getUserByEmail.mockResolvedValue(null);
            hashServiceMock.createHash.mockReturnValue('hashedPassword');
            userServiceMock.createUserByEmail.mockResolvedValue({ ...baseUser, email: dto.email });
            mailServiceMock.sendUserConfirmation.mockResolvedValue(undefined);

            const result = await authService.signupByEmail(dto);

            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
            expect(hashServiceMock.createHash).toHaveBeenCalledWith(dto.password);
            expect(userServiceMock.createUserByEmail).toHaveBeenCalledWith({
                email: dto.email,
                firstName: dto.firstName.trim(),
                password: 'hashedPassword',
            });
            expect(mailServiceMock.sendUserConfirmation).toHaveBeenCalledWith(
                dto.email,
                expect.any(String),
            );
            expect(result).toEqual({ user: { ...baseUser, email: dto.email } });
        });

        it('should throw ConflictException if email already exists', async () => {
            const dto: AuthSignupByEmailDto = {
                email: 'existing@example.com',
                firstName: 'Existing',
                password: 'password123',
            };
            userServiceMock.getUserByEmail.mockResolvedValue(baseUser);

            await expect(authService.signupByEmail(dto)).rejects.toThrow(ConflictException);
            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
        });
    });

    describe('signupByPhone', () => {
        it('should signup successfully with valid phone', async () => {
            const dto: AuthSignupByPhoneDto = { phone: '+1234567890', firstName: 'PhoneUser' };
            userServiceMock.getUserByPhone.mockResolvedValue(null);
            userServiceMock.createUserByPhone.mockResolvedValue({
                ...baseUser,
                phoneNumber: dto.phone,
            });
            callServiceMock.sendFlashCall.mockResolvedValue(undefined);

            const result = await authService.signupByPhone(dto);

            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
            expect(userServiceMock.createUserByPhone).toHaveBeenCalledWith({
                phone: dto.phone,
                firstName: dto.firstName.trim(),
            });
            expect(callServiceMock.sendFlashCall).toHaveBeenCalledWith({ phone: dto.phone });
            expect(result).toEqual({
                status: 200,
                description: 'Flash call initiated successfully',
            });
        });

        it('should throw ConflictException if phone already exists', async () => {
            const dto: AuthSignupByPhoneDto = { phone: '+1234567890', firstName: 'ExistingUser' };
            userServiceMock.getUserByPhone.mockResolvedValue(baseUser);

            await expect(authService.signupByPhone(dto)).rejects.toThrow(ConflictException);
            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            const dto: VerifyEmailDto = { verification: 'verification-code' };
            const user = { ...baseUser, isEmailVerified: false };
            const updatedUser = {
                ...user,
                isEmailVerified: true,
                verification: 'new-verification-code',
            };
            userServiceMock.findOne.mockResolvedValue(user);
            userServiceMock.updateUser.mockResolvedValue(updatedUser);

            const result = await authService.verifyEmail(dto);

            expect(userServiceMock.findOne).toHaveBeenCalledWith({
                verification: dto.verification,
                isEmailVerified: false,
                verificationExpires: { gt: expect.any(Date) },
            });
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(user.id, {
                isEmailVerified: true,
                verification: expect.any(String),
                verificationExpires: expect.any(Date),
            });
            expect(result).toEqual({ user: updatedUser });
        });

        it('should throw NotFoundException if verification code is invalid or expired', async () => {
            const dto: VerifyEmailDto = { verification: 'invalid-code' };
            userServiceMock.findOne.mockResolvedValue(null);

            await expect(authService.verifyEmail(dto)).rejects.toThrow(NotFoundException);
            expect(userServiceMock.findOne).toHaveBeenCalledWith({
                verification: dto.verification,
                isEmailVerified: false,
                verificationExpires: { gt: expect.any(Date) },
            });
        });
    });

    describe('verifyPhone', () => {
        it('should verify phone successfully', async () => {
            // Arrange
            const dto: VerifyPhoneDto = { phone: '+1234567890', code: '1234' };
            const user: User = { ...baseUser, isPhoneVerified: false };
            const updatedUser: User = { ...user, isPhoneVerified: true };
            const accessToken = 'access-token';
            const refreshToken = 'refresh-token';
            const userResponseDto = plainToInstance(UserResponseDto, updatedUser);

            userServiceMock.getUserByPhone.mockResolvedValue(user);
            callServiceMock.verifyFlashCall.mockResolvedValue(undefined);
            userServiceMock.updateUser.mockResolvedValue(updatedUser);
            jwtServiceMock.signAsync
                .mockResolvedValueOnce(accessToken)
                .mockResolvedValueOnce(refreshToken);

            jest.spyOn(authService, 'generateTokens').mockResolvedValue({
                accessToken,
                refreshToken,
            });

            const result = await authService.verifyPhone(dto);

            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
            expect(callServiceMock.verifyFlashCall).toHaveBeenCalledWith({
                phone: dto.phone,
                code: dto.code,
            });
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(user.id, {
                isPhoneVerified: true,
                verificationExpires: expect.any(Date),
            });
            expect(authService.generateTokens).toHaveBeenCalledWith({
                id: user.id,
                role: user.role,
            });
            expect(result).toEqual({
                accessToken,
                refreshToken,
                updatedUser: userResponseDto,
            });
        });

        it('should throw NotFoundException if phone not found', async () => {
            const dto: VerifyPhoneDto = { phone: '+1234567890', code: '1234' };
            userServiceMock.getUserByPhone.mockResolvedValue(null);

            await expect(authService.verifyPhone(dto)).rejects.toThrow(NotFoundException);
            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
        });

        it('should handle token generation errors gracefully', async () => {
            const dto: VerifyPhoneDto = { phone: '+1234567890', code: '1234' };
            const user: User = { ...baseUser, isPhoneVerified: false };
            const updatedUser: User = { ...user, isPhoneVerified: true };

            userServiceMock.getUserByPhone.mockResolvedValue(user);
            callServiceMock.verifyFlashCall.mockResolvedValue(undefined);
            userServiceMock.updateUser.mockResolvedValue(updatedUser);
            jwtServiceMock.signAsync
                .mockResolvedValueOnce('access-token')
                .mockRejectedValueOnce(new Error('Token generation failed'));

            jest.spyOn(authService, 'generateTokens').mockRejectedValue(
                new Error('Token generation failed'),
            );

            await expect(authService.verifyPhone(dto)).rejects.toThrow('Token generation failed');
            expect(userServiceMock.getUserByPhone).toHaveBeenCalledWith(dto.phone);
            expect(callServiceMock.verifyFlashCall).toHaveBeenCalledWith({
                phone: dto.phone,
                code: dto.code,
            });
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(user.id, {
                isPhoneVerified: true,
                verificationExpires: expect.any(Date),
            });
            expect(authService.generateTokens).toHaveBeenCalledWith({
                id: user.id,
                role: user.role,
            });
        });
    });

    describe('forgotPassword', () => {
        it('should initiate forgot password successfully', async () => {
            const req = {} as Request;
            const dto: ForgotPasswordDto = { email: 'user@example.com' };
            const user = { ...baseUser };
            prismaServiceMock.forgotPassword.create.mockResolvedValue({
                id: 'forgot-id',
                email: dto.email,
                verification: 'forgot-verification-code',
                expires: addHours(new Date(), 4),
                ip: '127.0.0.1',
                browser: 'TestBrowser',
                country: 'US',
                firstUsed: false,
                finalUsed: false,
            });
            userServiceMock.getUserByEmail.mockResolvedValue(user);
            mailServiceMock.sendPasswordReset.mockResolvedValue(undefined);

            jest.spyOn(authService, 'getIp').mockReturnValue('127.0.0.1');
            jest.spyOn(authService, 'getBrowserInfo').mockReturnValue('TestBrowser');
            jest.spyOn(authService, 'getCountry').mockReturnValue('US');

            const result = await authService.forgotPassword(req, dto);

            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
            expect(prismaServiceMock.forgotPassword.create).toHaveBeenCalledWith({
                data: {
                    email: dto.email,
                    verification: expect.any(String),
                    expires: expect.any(Date),
                    ip: '127.0.0.1',
                    browser: 'TestBrowser',
                    country: 'US',
                },
            });
            expect(mailServiceMock.sendPasswordReset).toHaveBeenCalledWith(
                dto.email,
                'forgot-verification-code',
            );
            expect(result).toEqual({
                email: dto.email,
                message: 'Verification letter sent.',
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            const req = {} as Request;
            const dto: ForgotPasswordDto = { email: 'nonexistent@example.com' };
            userServiceMock.getUserByEmail.mockResolvedValue(null);

            await expect(authService.forgotPassword(req, dto)).rejects.toThrow(NotFoundException);
            expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(dto.email);
        });
    });

    describe('forgotPasswordVerify', () => {
        it('should verify forgot password successfully', async () => {
            const req = {} as Request;
            const dto: ForgotPasswordVerifyDto = { verification: 'forgot-verification-code' };

            prismaServiceMock.forgotPassword.findFirst.mockResolvedValue(
                createForgotPasswordMock(),
            );
            prismaServiceMock.forgotPassword.update.mockResolvedValue({
                ...createForgotPasswordMock(),
                firstUsed: true,
                ipChanged: '127.0.0.1',
                browserChanged: 'TestBrowser',
                countryChanged: 'US',
            });

            jest.spyOn(authService, 'getIp').mockReturnValue('127.0.0.1');
            jest.spyOn(authService, 'getBrowserInfo').mockReturnValue('TestBrowser');
            jest.spyOn(authService, 'getCountry').mockReturnValue('US');

            const result = await authService.forgotPasswordVerify(req, dto);

            expect(prismaServiceMock.forgotPassword.findFirst).toHaveBeenCalledWith({
                where: {
                    verification: dto.verification,
                    firstUsed: false,
                    finalUsed: false,
                    expires: { gt: expect.any(Date) },
                },
            });
            expect(prismaServiceMock.forgotPassword.update).toHaveBeenCalledWith({
                where: { id: createForgotPasswordMock().id },
                data: {
                    firstUsed: true,
                    ipChanged: '127.0.0.1',
                    browserChanged: 'TestBrowser',
                    countryChanged: 'US',
                },
            });
            expect(result).toEqual({
                email: createForgotPasswordMock().email,
                message: 'Now you can reset your password.',
            });
        });

        it('should throw NotFoundException if forgot password request not found', async () => {
            const req = {} as Request;
            const dto: ForgotPasswordVerifyDto = { verification: 'invalid-code' };
            prismaServiceMock.forgotPassword.findFirst.mockResolvedValue(null);

            await expect(authService.forgotPasswordVerify(req, dto)).rejects.toThrow(
                NotFoundException,
            );
            expect(prismaServiceMock.forgotPassword.findFirst).toHaveBeenCalledWith({
                where: {
                    verification: dto.verification,
                    firstUsed: false,
                    finalUsed: false,
                    expires: { gt: expect.any(Date) },
                },
            });
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            const dto: ResetPasswordDto = { email: 'user@example.com', password: 'newpassword123' };

            const user = { ...baseUser, isEmailVerified: true };
            prismaServiceMock.forgotPassword.findFirst.mockResolvedValue(
                createForgotPasswordMock(),
            );
            prismaServiceMock.forgotPassword.update.mockResolvedValue({
                ...createForgotPasswordMock(),
                finalUsed: true,
            });
            userServiceMock.findOne.mockResolvedValue(user);
            hashServiceMock.createHash.mockReturnValue('newHashedPassword');
            userServiceMock.updateUser.mockResolvedValue({
                ...user,
                password: 'newHashedPassword',
            });

            const result = await authService.resetPassword(dto);

            expect(prismaServiceMock.forgotPassword.findFirst).toHaveBeenCalledWith({
                where: {
                    email: dto.email,
                    firstUsed: false,
                    finalUsed: false,
                    expires: { gt: expect.any(Date) },
                },
            });
            expect(prismaServiceMock.forgotPassword.update).toHaveBeenCalledWith({
                where: { id: createForgotPasswordMock().id },
                data: { finalUsed: true },
            });
            expect(userServiceMock.findOne).toHaveBeenCalledWith({
                email: dto.email,
                isEmailVerified: true,
            });
            expect(hashServiceMock.createHash).toHaveBeenCalledWith(dto.password);
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(user.id, {
                password: 'newHashedPassword',
            });
            expect(result).toEqual({
                email: dto.email,
                message: 'Password successfully changed.',
            });
        });

        it('should throw NotFoundException if forgot password request not found', async () => {
            const dto: ResetPasswordDto = {
                email: 'nonexistent@example.com',
                password: 'newpassword123',
            };
            prismaServiceMock.forgotPassword.findFirst.mockResolvedValue(null);

            await expect(authService.resetPassword(dto)).rejects.toThrow(NotFoundException);
            expect(prismaServiceMock.forgotPassword.findFirst).toHaveBeenCalledWith({
                where: {
                    email: dto.email,
                    firstUsed: false,
                    finalUsed: false,
                    expires: { gt: expect.any(Date) },
                },
            });
        });

        it('should throw NotFoundException if user not found or email not verified', async () => {
            const dto: ResetPasswordDto = { email: 'user@example.com', password: 'newpassword123' };

            prismaServiceMock.forgotPassword.findFirst.mockResolvedValue(
                createForgotPasswordMock(),
            );
            prismaServiceMock.forgotPassword.update.mockResolvedValue({
                ...createForgotPasswordMock(),
                finalUsed: true,
            });
            userServiceMock.findOne.mockResolvedValue(null);

            await expect(authService.resetPassword(dto)).rejects.toThrow(NotFoundException);
            expect(prismaServiceMock.forgotPassword.findFirst).toHaveBeenCalledWith({
                where: {
                    email: dto.email,
                    firstUsed: false,
                    finalUsed: false,
                    expires: { gt: expect.any(Date) },
                },
            });
            expect(userServiceMock.findOne).toHaveBeenCalledWith({
                email: dto.email,
                isEmailVerified: true,
            });
        });
    });

    describe('verifyToken', () => {
        it('should verify token successfully', async () => {
            const token = 'valid-token';
            const payload = { id: 'user-id', role: 'USER', tokenType: 'AccessToken' };
            jwtServiceMock.verifyAsync.mockResolvedValue(payload);

            const result = await authService.verifyToken(token);

            expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(token, {
                secret: 'access-secret',
            });
            expect(result).toEqual(payload);
        });

        it('should throw an error if token verification fails', async () => {
            const token = 'invalid-token';
            jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

            await expect(authService.verifyToken(token)).rejects.toThrow(Error);
            expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(token, {
                secret: 'access-secret',
            });
        });
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens successfully', async () => {
            const userPayload = { id: 'user-id', role: 'USER' };
            jwtServiceMock.signAsync
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');

            const result = await authService.generateTokens(userPayload);

            expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
                1,
                {
                    id: userPayload.id,
                    role: userPayload.role,
                    tokenType: 'AccessToken',
                },
                {
                    secret: 'access-secret',
                    expiresIn: '1h',
                },
            );
            expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
                2,
                {
                    id: userPayload.id,
                    role: userPayload.role,
                    tokenType: 'RefreshToken',
                },
                {
                    secret: 'refresh-secret',
                    expiresIn: '7d',
                },
            );
            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });
        });

        it('should handle token generation errors', async () => {
            const userPayload = { id: 'user-id', role: 'USER' };
            jwtServiceMock.signAsync.mockRejectedValue(new Error('Token generation failed'));

            await expect(authService.generateTokens(userPayload)).rejects.toThrow(Error);
            expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
        });
    });

    describe('Helper Methods', () => {
        describe('getIp', () => {
            it('should return the client IP when available', () => {
                (getClientIp as jest.Mock).mockReturnValue('192.168.1.1');
                const req = {} as Request;
                const authServiceAny = authService as any;

                const result = authServiceAny.getIp(req);

                expect(getClientIp).toHaveBeenCalledWith(req);
                expect(result).toBe('192.168.1.1');
            });

            it('should return undefined when client IP is not available', () => {
                (getClientIp as jest.Mock).mockReturnValue(undefined);
                const req = {} as Request;
                const authServiceAny = authService as any;

                const result = authServiceAny.getIp(req);

                expect(getClientIp).toHaveBeenCalledWith(req);
                expect(result).toBeUndefined();
            });
        });

        describe('getBrowserInfo', () => {
            it('should return the user-agent header when present', () => {
                const req = {
                    headers: {
                        'user-agent': 'Mozilla/5.0',
                    },
                } as Request;
                const authServiceAny = authService as any;

                const result = authServiceAny.getBrowserInfo(req);

                expect(result).toBe('Mozilla/5.0');
            });

            it('should return "XX" when user-agent header is missing', () => {
                const req = {
                    headers: {},
                } as Request;
                const authServiceAny = authService as any;

                const result = authServiceAny.getBrowserInfo(req);

                expect(result).toBe('XX');
            });
        });

        describe('getCountry', () => {
            it('should return the first country code from "cf-ipcountry" header when it is an array', () => {
                const req = {
                    headers: {
                        'cf-ipcountry': ['US', 'CA'],
                    },
                } as unknown as Request;
                const authServiceAny = authService as any;

                const result = authServiceAny.getCountry(req);

                expect(result).toBe('US');
            });

            it('should return "XX" when "cf-ipcountry" header is missing', () => {
                const req = {
                    headers: {},
                } as Request;
                const authServiceAny = authService as any;

                const result = authServiceAny.getCountry(req);

                expect(result).toBe('XX');
            });
        });
    });
});
