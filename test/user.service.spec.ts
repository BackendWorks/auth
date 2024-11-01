import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/common/services/prisma.service';
import { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';
import { UserService } from 'src/modules/user/services/user.service';

describe('UserService', () => {
    let service: UserService;
    let prismaService: PrismaService;

    const prismaServiceMock = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            updateMany: jest.fn(),
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserById', () => {
        it('should return a user by ID', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                isVerified: true,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                isDeleted: false,
                phone: null,
                avatar: null,
                password: 'hashed_password',
            };

            prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.getUserById('123');

            expect(result).toEqual(mockUser);
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
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                isVerified: true,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                isDeleted: false,
                phone: null,
                avatar: null,
                password: 'hashed_password',
            };

            prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.getUserByEmail('test@example.com');

            expect(result).toEqual(mockUser);
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
                createdAt: new Date(),
                updatedAt: new Date(),
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

    describe('createUser', () => {
        it('should create a new user', async () => {
            const signupData: AuthSignupDto = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
                username: 'newuser',
            };

            const createdUser = {
                id: '123',
                email: signupData.email,
                password: signupData.password,
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                role: 'USER',
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                isDeleted: false,
                phone: null,
                avatar: null,
            };

            prismaServiceMock.user.create.mockResolvedValue(createdUser);

            const result = await service.createUser(signupData);

            expect(result).toEqual(createdUser);
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: signupData.email,
                    password: signupData.password,
                    firstName: signupData.firstName.trim(),
                    lastName: signupData.lastName.trim(),
                    role: 'USER',
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
});
