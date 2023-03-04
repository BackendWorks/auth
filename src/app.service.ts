import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './services';
import { AuthService } from './services/auth.service';
import { CreateUserDto, LoginDto } from './dtos';
import { GetOtpDto, VerifyDto } from './dtos/verify.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(
    @Inject('FILES_SERVICE') private readonly fileClient: ClientProxy,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    this.fileClient.connect();
  }

  public async verifySignup(data: VerifyDto) {
    try {
      const { email, otp } = data;
      const response = await this.authService.verify(email, otp);
      await this.prisma.user.update({
        where: { email },
        data: {
          is_verified: true,
        },
      });
      return response;
    } catch (e) {
      throw e;
    }
  }

  public async getOtp(data: GetOtpDto) {
    try {
      const { email } = data;
      await this.authService.sendOtpRequest(email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  public async login(data: LoginDto) {
    try {
      const { email, password } = data;
      const authResponse = await this.authService.authenticateUser({
        email,
        password,
      });
      const user = await this.prisma.user.findUnique({ where: { email } });
      return {
        ...authResponse,
        user,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  public async signup(data: CreateUserDto) {
    try {
      const { email, password, firstName, lastName, deviceToken } = data;
      const response = await this.authService.registerUser({
        email,
        password,
      });
      const user = await this.prisma.user.create({
        data: {
          email,
          first_name: firstName?.trim(),
          last_name: lastName?.trim(),
          device_token: deviceToken?.trim(),
          is_verified: response.userConfirmed,
          cognito_sub: response.userSub,
        },
      });
      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException('user_exists', HttpStatus.CONFLICT);
        }
      } else {
        throw new BadRequestException(e.message);
      }
    }
  }

  public me(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public getUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
