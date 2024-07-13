import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/services/prisma.service';
import { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';
import { UserService } from 'src/modules/user/services/user.service';

const prismaServiceMock = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = '1';
      const user = {
        id: userId,
        email: 'test@example.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        is_deleted: false,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        phone: null,
        avatar: null,
        role: 'User',
      } as UserResponseDto;

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const user = {
        id: '1',
        email: 'test@example.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        is_deleted: false,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        phone: null,
        avatar: null,
        role: 'User',
      } as UserResponseDto;

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByEmail(email);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('getUserByUserName', () => {
    it('should return a user by username', async () => {
      const username = 'username';
      const user = {
        id: '1',
        email: 'test@example.com',
        first_name: 'First',
        last_name: 'Last',
        username: 'username',
        is_deleted: false,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        phone: null,
        avatar: null,
        role: 'User',
      } as UserResponseDto;

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByUserName(username);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateData: UserUpdateDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'updated@example.com',
        phone: '1234567890',
        avatar: 'http://example.com/profile.jpg',
      };
      const updatedUser = {
        id: userId,
        email: updateData.email,
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        username: 'username',
        is_deleted: false,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        phone: updateData.phone,
        avatar: updateData.avatar,
        role: 'User',
      } as UserResponseDto;

      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        data: {
          first_name: updateData.firstName?.trim(),
          last_name: updateData.lastName?.trim(),
          email: updateData.email,
          phone: updateData.phone,
          avatar: updateData.avatar,
        },
        where: { id: userId },
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const signupData: AuthSignupDto = {
        email: 'newuser@example.com',
        firstName: 'NewFirst',
        lastName: 'NewLast',
        password: 'password',
        username: 'newusername',
      };
      const createdUser = {
        id: '1',
        email: signupData.email,
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        username: signupData.username,
        is_deleted: false,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        phone: null,
        avatar: null,
        role: 'User',
      } as UserResponseDto;

      prismaServiceMock.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(signupData);

      expect(result).toEqual(createdUser);
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: signupData.email,
          password: signupData.password,
          first_name: signupData.firstName.trim(),
          last_name: signupData.lastName.trim(),
          role: 'User',
          username: signupData.username.trim(),
        },
      });
    });
  });

  describe('softDeleteUsers', () => {
    it('should soft delete users', async () => {
      const userIds = ['1', '2', '3'];

      prismaServiceMock.user.updateMany.mockResolvedValue({
        count: userIds.length,
      });

      await service.softDeleteUsers(userIds);

      expect(prismaServiceMock.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: {
          is_deleted: true,
          deleted_at: expect.any(Date),
        },
      });
    });
  });
});
