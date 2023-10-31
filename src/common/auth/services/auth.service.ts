import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from '../dtos/login.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { HelperService } from './helper.service';
import { UserCreateDto } from '../dtos/signup.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService implements IAuthService {
  private readonly accessTokenSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly helperService: HelperService,
  ) {
    this.accessTokenSecret = this.configService.get<string>(
      'auth.accessToken.secret',
    );
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
      throw new Error(e);
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
          user: user.id,
        },
        {
          secret: this.accessTokenSecret,
        },
      );
      return {
        accessToken,
        user: createdUser,
      };
    } catch (e) {
      throw new Error(e);
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
