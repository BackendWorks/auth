import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { AuthService } from '../src/modules/auth/services/auth.service';
import { UserService } from '../src/modules/user/services/user.service';
import { HelperHashService } from '../src/common/services/helper.hash.service';
import { IAuthPayload } from '../src/modules/auth/interfaces/auth.interface';
import { AuthLoginDto } from '../src/modules/auth/dtos/auth.login.dto';
import { AuthSignupDto } from '../src/modules/auth/dtos/auth.signup.dto';

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
  getUserByUserName: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should verify and return token data', async () => {
      const token = 'valid-token';
      const payload: IAuthPayload = { id: '1', role: 'user' };
      jwtServiceMock.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyToken(token);

      expect(result).toEqual(payload);
      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'accessTokenSecret',
      });
    });

    it('should throw an error if token verification fails', async () => {
      const token = 'invalid-token';
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user: IAuthPayload = { id: '1', role: 'user' };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      jwtServiceMock.signAsync.mockImplementation(async (payload, options) => {
        if (options.secret === 'accessTokenSecret') return accessToken;
        if (options.secret === 'refreshTokenSecret') return refreshToken;
      });

      const result = await service.generateTokens(user);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if token generation fails', async () => {
      const user: IAuthPayload = { id: '1', role: 'user' };
      jwtServiceMock.signAsync.mockRejectedValue(
        new Error('Token generation failed'),
      );

      await expect(service.generateTokens(user)).rejects.toThrow(
        'Token generation failed',
      );
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const loginDto: AuthLoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      };
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      userServiceMock.getUserByEmail.mockResolvedValue(user);
      helperHashServiceMock.match.mockResolvedValue(true);
      service.generateTokens = jest.fn().mockResolvedValue(tokens);

      const result = await service.login(loginDto);

      expect(result).toEqual({ ...tokens, user });
      expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(helperHashServiceMock.match).toHaveBeenCalledWith(
        user.password,
        loginDto.password,
      );
      expect(service.generateTokens).toHaveBeenCalledWith({
        id: user.id,
        role: user.role,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const loginDto: AuthLoginDto = {
        email: 'notfound@example.com',
        password: 'password',
      };
      userServiceMock.getUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if password does not match', async () => {
      const loginDto: AuthLoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      };
      userServiceMock.getUserByEmail.mockResolvedValue(user);
      helperHashServiceMock.match.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('signup', () => {
    it('should successfully sign up a user', async () => {
      const signupDto: AuthSignupDto = {
        email: 'test@example.com',
        firstName: 'First',
        lastName: 'Last',
        password: 'password',
        username: 'username',
      };
      const createdUser = {
        id: 1,
        email: signupDto.email,
        firstName: signupDto.firstName,
        lastName: signupDto.lastName,
        password: 'hashedPassword',
        username: signupDto.username,
        role: 'user',
      };
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      userServiceMock.getUserByEmail.mockResolvedValue(null);
      userServiceMock.getUserByUserName.mockResolvedValue(null);
      helperHashServiceMock.createHash.mockReturnValue('hashedPassword');
      userServiceMock.createUser.mockResolvedValue(createdUser);
      service.generateTokens = jest.fn().mockResolvedValue(tokens);

      const result = await service.signup(signupDto);

      expect(result).toEqual({ ...tokens, user: createdUser });
      expect(userServiceMock.getUserByEmail).toHaveBeenCalledWith(
        signupDto.email,
      );
      expect(userServiceMock.getUserByUserName).toHaveBeenCalledWith(
        signupDto.username,
      );
      expect(helperHashServiceMock.createHash).toHaveBeenCalledWith(
        signupDto.password,
      );
      expect(userServiceMock.createUser).toHaveBeenCalledWith({
        email: signupDto.email,
        firstName: signupDto.firstName.trim(),
        lastName: signupDto.lastName.trim(),
        password: 'hashedPassword',
        username: signupDto.username.trim(),
      });
      expect(service.generateTokens).toHaveBeenCalledWith({
        id: createdUser.id,
        role: createdUser.role,
      });
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const signupDto: AuthSignupDto = {
        email: 'existing@example.com',
        firstName: 'First',
        lastName: 'Last',
        password: 'password',
        username: 'username',
      };
      userServiceMock.getUserByEmail.mockResolvedValue({ id: 1 });

      const responsePromise = service.signup(signupDto);

      await expect(responsePromise).rejects.toThrow(ConflictException);
      await expect(responsePromise).rejects.toThrow('user.userExistsByEmail');
    });

    it('should throw ConflictException if user with username already exists', async () => {
      const signupDto: AuthSignupDto = {
        email: 'test@example.com',
        firstName: 'First',
        lastName: 'Last',
        password: 'password',
        username: 'existingUsername',
      };
      userServiceMock.getUserByEmail.mockResolvedValue(null);
      userServiceMock.getUserByUserName.mockResolvedValue({ id: 1 });

      const responsePromise = service.signup(signupDto);

      await expect(responsePromise).rejects.toThrow(ConflictException);
      await expect(responsePromise).rejects.toThrow(
        'user.userExistsByUserName',
      );
    });
  });
});
