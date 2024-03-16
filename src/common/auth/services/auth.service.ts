import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from '../dtos/login.dto';
import { PrismaService } from '../../../common/services/prisma.service';
import { HelperService } from './helper.service';
import { UserCreateDto } from '../dtos/signup.dto';
import { Role } from '@prisma/client';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService implements IAuthService {
  public logger: Logger;
  private readonly accessTokenSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly helperService: HelperService,
  ) {
    this.logger = new Logger(AuthService.name);
    this.accessTokenSecret = this.configService.get<string>(
      'auth.accessToken.secret',
    );
  }

  public generateSecret(): string {
    return authenticator.generateSecret();
  }

  public generateTotpUri(username: string, secret: string): string {
    return authenticator.keyuri(username, 'microservices', secret);
  }

  public verifyTotp(secret: string, token: string): boolean {
    return authenticator.check(token, secret);
  }

  public async enableTwoFaForUser(userId: number) {
    const secret = this.generateSecret();
    await this.prismaService.user.update({
      data: {
        two_factor_secret: secret,
      },
      where: {
        id: userId,
      },
    });
    return { secret };
  }

  public async verifyTwoFactorAuth(userId: number, token: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (user && user.two_factor_secret) {
      const isValid = this.verifyTotp(user.two_factor_secret, token);
      return { isValid };
    } else {
      return { isValid: false, message: 'User has not enabled 2FA.' };
    }
  }

  public async login(data: UserLoginDto) {
    try {
      const { email, password } = data;
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException('userNotFound');
      }
      const match = this.helperService.match(user.password, password);
      if (!match) {
        throw new NotFoundException('invalidPassword');
      }
      const accessToken = this.jwtService.sign(
        {
          user: user.id,
        },
        {
          secret: this.accessTokenSecret,
        },
      );
      return {
        accessToken,
        user,
      };
    } catch (e) {
      throw e;
    }
  }

  public async signup(data: UserCreateDto) {
    try {
      const { email, firstName, lastName, password } = data;
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (user) {
        throw new HttpException('userExists', HttpStatus.CONFLICT);
      }
      const createdUser = await this.prismaService.user.create({
        data: {
          email,
          password: this.helperService.createHash(password),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: Role.USER,
        },
      });
      const accessToken = this.jwtService.sign(
        {
          id: createdUser?.id,
          role: createdUser?.role,
          deviceToken: createdUser?.device_token,
        },
        {
          secret: this.accessTokenSecret,
        },
      );
      delete createdUser.password;
      return {
        accessToken,
        user: createdUser,
      };
    } catch (e) {
      throw e;
    }
  }

  public async me(id: number) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }
}
