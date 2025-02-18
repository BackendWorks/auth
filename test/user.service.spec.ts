import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/common/services/prisma.service';
import { AuthSignupByEmailDto, AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { addDays } from 'date-fns';
import { createMockUser } from './helpers/user.helper';
import { Prisma } from '@prisma/client';

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-verification-token'), // Mock verification token
}));

describe('UserService', () => {
    let service: UserService;
    let prismaService: PrismaService;

    const prismaServiceMock = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            updateMany: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2024-12-24T17:19:59.500Z').getTime());
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    const baseUser = createMockUser();

    describe('getUserById', () => {
        it('should return a user by ID', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(baseUser);

            const result = await service.getUserById('123');

            expect(result).toEqual(baseUser);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: '123' },
            });
        });

        it('should return null when user not found', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(null);

            const result = await service.getUserById('nonexistent');

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'nonexistent' },
            });
        });
    });

    describe('getUserByEmail', () => {
        it('should return a user by email', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(baseUser);

            const result = await service.getUserByEmail('test@example.com');

            expect(result).toEqual(baseUser);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            const userId = '123';
            const updateData: UserUpdateDto = {
                firstName: 'Updated',
                lastName: 'Name',
                email: 'updated@example.com',
                phoneNumber: '1234567890',
                avatar: 'new-avatar.jpg',
            };

            const updatedUser = {
                id: userId,
                email: updateData.email,
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                phone: updateData.phoneNumber,
                avatar: updateData.avatar,
                isVerified: true,
                role: 'USER',
                createdAt: new Date('2024-12-24T17:19:59.500Z'),
                updatedAt: new Date('2024-12-24T17:19:59.500Z'),
                deletedAt: null,
                isDeleted: false,
                password: 'hashed_password',
            };

            prismaServiceMock.user.update.mockResolvedValue(updatedUser);

            const result = await service.updateUser(userId, updateData);

            expect(result).toEqual(updatedUser);
            expect(prismaService.user.update).toHaveBeenCalledWith({
                data: {
                    firstName: updateData.firstName?.trim(),
                    lastName: updateData.lastName?.trim(),
                    email: updateData.email,
                    phoneNumber: updateData.phoneNumber,
                    avatar: updateData.avatar,
                },
                where: { id: userId },
            });
        });
    });

    describe('createUserByEmail', () => {
        it('should create a new user', async () => {
            const signupData: AuthSignupByEmailDto = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
            };

            const createdUser = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                patronymic: 'Junior',
                verification: 'mock-verification-token',
                isEmailVerified: false,
                isPhoneVerified: false,
                role: 'USER',
                createdAt: new Date('2024-12-24T17:19:59.500Z'),
                updatedAt: new Date('2024-12-24T17:19:59.500Z'),
                deletedAt: null,
                isDeleted: false,
                phone: null,
                avatar: null,
                password: 'hashed_password',
            };

            prismaServiceMock.user.create.mockResolvedValue(createdUser);

            const result = await service.createUserByEmail(signupData);

            expect(result).toEqual(createdUser);
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: signupData.email,
                    password: signupData.password,
                    firstName: signupData.firstName.trim(),
                    role: 'USER',
                    verification: 'mock-verification-token',
                    isEmailVerified: false,
                    blockExpires: null,
                    loginAttempts: 0,
                    verificationExpires: addDays(new Date(), 1),
                },
            });
        });
    });

    describe('createUserByPhone', () => {
        it('should create a new user with phone number', async () => {
            const signupData: AuthSignupByPhoneDto = {
                phone: '+1234567890',
                firstName: 'Jane',
            };

            const createdUser = createMockUser({
                email: null,
                phoneNumber: signupData.phone.trim(),
                firstName: signupData.firstName.trim(),
                isPhoneVerified: false,
                verificationExpires: addDays(new Date(), 1),
            });

            prismaServiceMock.user.create.mockResolvedValue(createdUser);

            const result = await service.createUserByPhone(signupData);

            expect(result).toEqual(createdUser);
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: null,
                    phoneNumber: signupData.phone.trim(),
                    firstName: signupData.firstName.trim(),
                    role: 'USER',
                    isPhoneVerified: false,
                    verificationExpires: addDays(new Date(), 1),
                    loginAttempts: 0,
                    blockExpires: null,
                },
            });
        });

        it('should throw an error if user creation fails', async () => {
            const signupData: AuthSignupByPhoneDto = {
                phone: '+1234567890',
                firstName: 'Jane',
            };

            prismaServiceMock.user.create.mockRejectedValue(new Error('User creation failed'));

            await expect(service.createUserByPhone(signupData)).rejects.toThrow(
                'User creation failed',
            );
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: null,
                    phoneNumber: signupData.phone.trim(),
                    firstName: signupData.firstName.trim(),
                    role: 'USER',
                    isPhoneVerified: false,
                    verificationExpires: addDays(new Date(), 1),
                    loginAttempts: 0,
                    blockExpires: null,
                },
            });
        });

        it('should trim phone number and first name', async () => {
            const signupData: AuthSignupByPhoneDto = {
                phone: '   +1234567890   ',
                firstName: '   Jane   ',
            };

            const expectedPhone = '+1234567890';
            const expectedFirstName = 'Jane';

            const createdUser = createMockUser({
                email: null,
                phoneNumber: expectedPhone,
                firstName: expectedFirstName,
                isPhoneVerified: false,
                verificationExpires: addDays(new Date(), 1),
            });

            prismaServiceMock.user.create.mockResolvedValue(createdUser);

            const result = await service.createUserByPhone(signupData);

            expect(result).toEqual(createdUser);
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: null,
                    phoneNumber: expectedPhone,
                    firstName: expectedFirstName,
                    role: 'USER',
                    isPhoneVerified: false,
                    verificationExpires: addDays(new Date(), 1),
                    loginAttempts: 0,
                    blockExpires: null,
                },
            });
        });
    });

    describe('softDeleteUsers', () => {
        it('should soft delete multiple users', async () => {
            const userIds = ['123', '456', '789'];

            prismaServiceMock.user.updateMany.mockResolvedValue({
                count: userIds.length,
            });

            await service.softDeleteUsers(userIds);

            expect(prismaService.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: {
                        in: userIds,
                    },
                },
                data: {
                    deletedAt: expect.any(Date),
                },
            });
        });

        it('should handle empty user ids array', async () => {
            const userIds: string[] = [];

            await service.softDeleteUsers(userIds);

            expect(prismaService.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: {
                        in: [],
                    },
                },
                data: {
                    deletedAt: expect.any(Date),
                },
            });
        });
    });

    describe('getUserByPhone', () => {
        it('should return a UserResponseDto by phone number', async () => {
            const mockUser = createMockUser();

            prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.getUserByPhone('+1234567890');

            expect(result).toEqual(mockUser);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { phoneNumber: '+1234567890' },
            });
        });

        it('should return null when user not found by phone number', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(null);

            const result = await service.getUserByPhone('+0987654321');

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { phoneNumber: '+0987654321' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a user matching the criteria', async () => {
            const mockUser = createMockUser();

            const where: Prisma.UserWhereInput = {
                email: 'test@example.com',
                isEmailVerified: true,
            };

            prismaServiceMock.user.findFirst.mockResolvedValue(mockUser);

            const result = await service.findOne(where);

            expect(result).toEqual(mockUser);
            expect(prismaService.user.findFirst).toHaveBeenCalledWith({
                where,
            });
        });

        it('should return null when no user matches the criteria', async () => {
            const where: Prisma.UserWhereInput = {
                email: 'nonexistent@example.com',
                isEmailVerified: true,
            };

            prismaServiceMock.user.findFirst.mockResolvedValue(null);

            const result = await service.findOne(where);

            expect(result).toBeNull();
            expect(prismaService.user.findFirst).toHaveBeenCalledWith({
                where,
            });
        });
    });
});
