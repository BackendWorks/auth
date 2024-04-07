import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../modules/user/services/user.service';
import { HelperHashService } from './helper.hash.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { authenticator } from 'otplib';

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'randomSecret') }));

const configServiceMock = {
  get: jest.fn((key) => {
    switch (key) {
      case 'auth.accessToken.secret':
        return 'accessTokenSecret';
      case 'auth.refreshToken.secret':
        return 'refreshTokenSecret';
      case 'auth.accessToken.expirationTime':
        return '1h';
      case 'auth.refreshToken.expirationTime':
        return '7d';
      default:
        return null;
    }
  }),
};

const userServiceMock = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
  updateUserTwoFaSecret: jest.fn(),
};

const jwtServiceMock = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const helperHashServiceMock = {
  createHash: jest.fn(),
  match: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let helperHashService: HelperHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
          provide: HelperHashService,
          useValue: helperHashServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    helperHashService = module.get<HelperHashService>(HelperHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(helperHashService).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const tokenPayload = { id: 1, role: 'user', device_token: 'deviceToken' };
      jwtServiceMock.verifyAsync.mockResolvedValue(tokenPayload);

      const result = await service.verifyToken('someToken');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('someToken', {
        secret: 'accessTokenSecret',
      });
      expect(result).toEqual(tokenPayload);
    });
  });

  describe('login', () => {
    it('should throw NotFoundException if user not found', async () => {
      userServiceMock.getUserByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(new NotFoundException('userNotFound'));
    });

    it('should login successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        device_token: 'deviceToken',
        role: 'user',
      };
      const tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      userServiceMock.getUserByEmail.mockResolvedValue(user);
      helperHashServiceMock.match.mockReturnValue(true);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(expect.objectContaining(tokens));
    });
  });

  describe('signup', () => {
    it('should sign up a new user and return tokens', async () => {
      const userCreateDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        username: 'testUser',
      };

      userServiceMock.getUserByEmail.mockResolvedValue(null);

      helperHashServiceMock.createHash.mockReturnValue('hashedPassword');

      userServiceMock.createUser.mockResolvedValue({
        ...userCreateDto,
        id: 1,
        device_token: 'deviceToken',
        roles_id: 'roleId',
        password: 'hashedPassword',
      });

      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const result = await service.signup(userCreateDto);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(userService.createUser).toHaveBeenCalledWith({
        ...userCreateDto,
        password: 'hashedPassword',
      });
    });

    it('should throw HttpException when the user already exists', async () => {
      const userCreateDto = {
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
        password: 'password123',
        username: 'existingUser',
      };

      userServiceMock.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      await expect(service.signup(userCreateDto)).rejects.toThrow(
        HttpException,
      );
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        userCreateDto.email,
      );
      jest.clearAllMocks();
      expect(userService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('enableTwoFaForUser', () => {
    it('should enable 2FA for a user', async () => {
      const userId = 1;
      const token = 'generatedToken';
      const email = 'user@example.com';

      userServiceMock.updateUserTwoFaSecret.mockResolvedValue({
        id: userId,
        email,
        two_factor_secret: token,
      });

      const result = await service.enableTwoFaForUser(userId);

      expect(result).toEqual(expect.any(Object));
    });
  });

  describe('verifyTwoFactorAuth', () => {
    it('should return true for valid 2FA token', async () => {
      const userId = 1;
      const token = '123456';
      const userWith2FASecret = { id: userId, two_factor_secret: 'SECRET' };

      userServiceMock.getUserById.mockResolvedValue(userWith2FASecret);
      jest.spyOn(authenticator, 'check').mockReturnValue(true);

      const isValid = await service.verifyTwoFactorAuth(userId, token);

      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(authenticator.check).toHaveBeenCalledWith(
        userWith2FASecret.two_factor_secret,
        token,
      );
      expect(isValid).toBe(true);
    });

    it('should return false for invalid 2FA token', async () => {
      const userId = 1;
      const token = 'wrong_token';
      const userWith2FASecret = { id: userId, two_factor_secret: 'SECRET' };

      userServiceMock.getUserById.mockResolvedValue(userWith2FASecret);
      jest.spyOn(authenticator, 'check').mockReturnValue(false);

      const isValid = await service.verifyTwoFactorAuth(userId, token);

      expect(isValid).toBe(false);
    });

    it('should return false if user does not have 2FA secret', async () => {
      const userId = 1;
      const token = '123456';
      const userWithout2FASecret = { id: userId, two_factor_secret: null };

      userServiceMock.getUserById.mockResolvedValue(userWithout2FASecret);

      const isValid = await service.verifyTwoFactorAuth(userId, token);

      expect(isValid).toBe(false);
    });
  });
});
