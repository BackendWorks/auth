import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../src/common/services/prisma.service';
import { UserService } from '../../../src/modules/user/services/user.service';

const prismaServiceMock = {
  user: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

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

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const role = { id: 1, name: 'User' };
      const userData = {
        email: 'jane@example.com',
        password: 'password',
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
      };
      const createdUser = { ...userData, id: 2, role };
      prismaServiceMock.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(userData as any);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.anything(),
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = 1;
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };
      const updatedUser = { ...userData, id: userId };
      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, userData);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('getUserById', () => {
    it('should return a user for a given ID', async () => {
      const user = {
        id: 1,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserById(1);
      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user for a given email', async () => {
      const user = {
        id: 1,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByEmail('user@example.com');
      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });
  });

  describe('softDeleteUsers', () => {
    it('should soft delete users for given IDs', async () => {
      const userIds = [1, 2, 3];
      const batchPayload = { count: userIds.length };
      const successResponse = { status: true, message: expect.any(String) };
      prismaServiceMock.user.updateMany.mockResolvedValue(batchPayload);

      const result = await service.softDeleteUsers(userIds);
      expect(result).toEqual(successResponse);
      expect(prismaServiceMock.user.updateMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: userIds,
          },
        },
        data: {
          is_deleted: true,
          deleted_at: expect.any(Date),
        },
      });
    });
  });

  describe('deleteUsers', () => {
    it('should delete users for given IDs', async () => {
      const userIds = [1, 2, 3];
      const batchPayload = { count: userIds.length };
      const successResponse = { status: true, message: expect.any(String) };
      prismaServiceMock.user.deleteMany.mockResolvedValue(batchPayload);

      const result = await service.deleteUsers(userIds);
      expect(result).toEqual(successResponse);
      expect(prismaServiceMock.user.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: userIds,
          },
        },
      });
    });
  });
});
