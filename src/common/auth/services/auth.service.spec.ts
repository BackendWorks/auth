import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../common/services/prisma.service';
import { HelperService } from './helper.service';
import { UserLoginDto } from '../dtos/login.dto';
import { UserCreateDto } from '../dtos/signup.dto';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaServiceMock;
  let jwtServiceMock;
  let helperServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: HelperService,
          useValue: {
            match: jest.fn(),
            createHash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaServiceMock = module.get<PrismaService>(PrismaService);
    jwtServiceMock = module.get<JwtService>(JwtService);
    helperServiceMock = module.get<HelperService>(HelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw NotFoundException when user not found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);
      const data: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      await expect(service.login(data)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when password is invalid', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue({
        id: 1,
        password: 'hashedPassword',
      });
      helperServiceMock.match.mockReturnValue(false);
      const data: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      await expect(service.login(data)).rejects.toThrow(NotFoundException);
    });

    it('should return accessToken and user when login is successful', async () => {
      const user = { id: 1, password: 'hashedPassword' };
      prismaServiceMock.user.findUnique.mockResolvedValue(user);
      helperServiceMock.match.mockReturnValue(true);
      jwtServiceMock.sign.mockReturnValue('accessToken');
      const data: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await service.login(data);
      expect(result).toEqual({ accessToken: 'accessToken', user });
    });
  });

  describe('signup', () => {
    it('should throw HttpException with CONFLICT status when user already exists', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue({});
      const data: UserCreateDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };
      await expect(service.signup(data)).rejects.toThrow(
        new HttpException('userExists', HttpStatus.CONFLICT),
      );
    });

    it('should return accessToken and user when signup is successful', async () => {
      const createdUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };
      prismaServiceMock.user.findUnique.mockResolvedValue(null);
      prismaServiceMock.user.create.mockResolvedValue(createdUser);
      jwtServiceMock.sign.mockReturnValue('accessToken');
      const data: UserCreateDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };
      const result = await service.signup(data);
      expect(result).toEqual({ accessToken: 'accessToken', user: createdUser });
    });
  });
});
