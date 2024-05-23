import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  IAuthPayload,
  IAuthResponse,
  ITokenResponse,
} from '../interfaces/auth.interface';
import { UserService } from '../../user/services/user.service';
import { UserLoginDto } from '../dtos/auth.login.dto';
import { UserCreateDto } from '../dtos/auth.signup.dto';
import { HelperHashService } from './helper.hash.service';
import { IAuthService } from '../interfaces/auth.service.interface';
import { TokenType } from '../../../app/app.constant';

@Injectable()
export class AuthService implements IAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExp: string;
  private readonly refreshTokenExp: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly helperHashService: HelperHashService,
  ) {
    this.accessTokenSecret = this.configService.get<string>(
      'auth.accessToken.secret',
    );
    this.refreshTokenSecret = this.configService.get<string>(
      'auth.refreshToken.secret',
    );
    this.accessTokenExp = this.configService.get<string>(
      'auth.accessToken.expirationTime',
    );
    this.refreshTokenExp = this.configService.get<string>(
      'auth.refreshToken.expirationTime',
    );
  }

  public async verifyToken(accessToken: string): Promise<IAuthPayload> {
    try {
      const data = await this.jwtService.verifyAsync(accessToken, {
        secret: this.accessTokenSecret,
      });
      return data;
    } catch (e) {
      throw e;
    }
  }

  public async generateTokens(user: IAuthPayload): Promise<ITokenResponse> {
    try {
      const accessTokenPromise = this.jwtService.signAsync(
        {
          id: user.id,
          role: user.role,
          deviceToken: user.device_token,
          tokenType: TokenType.ACCESS_TOKEN,
        },
        {
          secret: this.accessTokenSecret,
          expiresIn: this.accessTokenExp,
        },
      );
      const refreshTokenPromise = this.jwtService.signAsync(
        {
          id: user.id,
          role: user.role,
          deviceToken: user.device_token,
          tokenType: TokenType.REFRESH_TOKEN,
        },
        {
          secret: this.refreshTokenSecret,
          expiresIn: this.refreshTokenExp,
        },
      );
      const [accessToken, refreshToken] = await Promise.all([
        accessTokenPromise,
        refreshTokenPromise,
      ]);
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw e;
    }
  }

  public async login(data: UserLoginDto): Promise<IAuthResponse> {
    try {
      const { email, password } = data;
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('userNotFound');
      }
      const match = this.helperHashService.match(user.password, password);
      if (!match) {
        throw new NotFoundException('invalidPassword');
      }
      const tokens = await this.generateTokens({
        id: user.id,
        device_token: user.device_token,
        role: user.role,
      });
      return {
        ...tokens,
        user,
      };
    } catch (e) {
      throw e;
    }
  }

  public async signup(data: UserCreateDto): Promise<IAuthResponse> {
    try {
      const { email, firstName, lastName, password, username } = data;
      const findUser = await this.userService.getUserByEmail(email);
      if (findUser) {
        throw new HttpException('userExists', HttpStatus.CONFLICT);
      }
      const passwordHashed = this.helperHashService.createHash(password);
      const createdUser = await this.userService.createUser({
        email,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        password: passwordHashed,
        username: username?.trim(),
      });
      const tokens = await this.generateTokens({
        id: createdUser.id,
        device_token: createdUser.device_token,
        role: createdUser.role,
      });
      delete createdUser.password;
      return {
        ...tokens,
        user: createdUser,
      };
    } catch (e) {
      throw e;
    }
  }
}