import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { Role } from '@prisma/client';

describe('UserService', () => {
  let service: UserService; // Typed service variable
  let prismaServiceMock; // Typed Prisma service mock

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService); // Corrected service retrieval
    prismaServiceMock = module.get<PrismaService>(PrismaService); // Corrected Prisma service mock retrieval
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: Role.USER,
      };
      const userId = 1;

      prismaServiceMock.user.update.mockResolvedValueOnce(updateDto); // Mocking the Prisma user update

      const result = await service.updateUser(updateDto, userId); // Assuming updateUser takes userId as the first argument

      expect(result).toEqual(updateDto);
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        data: {
          first_name: updateDto.firstName.trim(),
          last_name: updateDto.lastName.trim(),
          email: updateDto.email,
          phone: updateDto.phone,
          role: updateDto.role,
        },
        where: { id: userId },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user successfully', async () => {
      const userId = 1;
      const user = { id: userId, firstName: 'John', lastName: 'Doe' };

      prismaServiceMock.user.findUnique.mockResolvedValueOnce(user); // Mocking the Prisma user findUnique

      const result = await service.getUserById(userId);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;

      prismaServiceMock.user.delete.mockResolvedValueOnce({ id: userId }); // Mocking the Prisma user delete

      const result = await service.deleteUser(userId);

      expect(result).toEqual({ id: userId });
      expect(prismaServiceMock.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
