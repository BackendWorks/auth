import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { CognitoService } from './cognito.service';
import { GetOtpDto, VerifyDto } from '../dtos/cognito-verify.dto';
import { LoginDto } from '../dtos/cognito-login.dto';
import { CreateUserDto } from '../dtos/cognito-signup.dto';

@Injectable()
export class CongnitoAuthService {
  constructor(
    @Inject('FILES_SERVICE') private readonly fileClient: ClientProxy,
    private readonly prismaService: PrismaService,
    private readonly cognitoService: CognitoService,
  ) {
    this.fileClient.connect();
  }

  public async getUserByEmail(email) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  public async getUserById(id: number) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  public async verifySignup(data: VerifyDto) {
    try {
      const { email, otp } = data;
      const response = await this.cognitoService.verify(email, otp);
      await this.prismaService.user.update({
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
      await this.cognitoService.sendOtpRequest(email);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  public async login(data: LoginDto) {
    try {
      const { email, password } = data;
      const authResponse = await this.cognitoService.authenticateUser({
        email,
        password,
      });
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
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
      const response = await this.cognitoService.registerUser({
        email,
        password,
      });
      const user = await this.prismaService.user.create({
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
          throw new HttpException('userExists', HttpStatus.CONFLICT);
        }
      } else {
        throw new BadRequestException(e.message);
      }
    }
  }
}
