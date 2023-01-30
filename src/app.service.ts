import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as moment from 'moment';
import { CreateUserDto, ForgotPasswordDto, LoginDto } from './core/dtos';
import { ClientProxy } from '@nestjs/microservices';
import { IMailPayload } from './types';
import { PrismaService } from './core/services';
import { Token, User, Role, TokenStatus } from '@prisma/client';
import {
  ConfigService,
  TokenService,
  compareHash,
  createHash,
} from './core/services';

@Injectable()
export class AppService {
  constructor(
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    private configService: ConfigService,
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {
    this.mailClient.connect();
  }

  public getUserById(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  public async getDeviceById(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user.device_token;
  }

  public async getForgotPasswordToken(authUserId: number): Promise<Token> {
    try {
      const user = await this.getUserById(authUserId);
      if (!user) {
        throw new HttpException('user_not_found', HttpStatus.NOT_FOUND);
      }
      const token = nanoid(10);
      const save_token = await this.prisma.token.create({
        data: {
          token,
          user: {
            connect: {
              id: authUserId,
            },
          },
          status: TokenStatus.ISSUED,
        },
      });
      return save_token;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async changePassword(
    data: ForgotPasswordDto,
    authUserId: number,
  ): Promise<void> {
    try {
      const { newPassword, token } = data;
      const user = await this.prisma.user.findUnique({
        where: { id: authUserId },
      });
      if (!user) {
        throw new HttpException('user_not_found', HttpStatus.NOT_FOUND);
      }
      const getActiveToken = await this.prisma.token.findFirst({
        where: {
          user: { id: authUserId },
          status: TokenStatus.ISSUED,
          token,
        },
      });
      if (!getActiveToken) {
        throw new HttpException(
          'active_token_not_found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const addExp = moment().add(
        Number(this.configService.get('tokenExp')),
        'second',
      );
      if (moment(getActiveToken.created_at).isAfter(addExp)) {
        throw new HttpException(
          'forgot_token_expired',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const hashPassword = createHash(newPassword);
      await this.prisma.user.update({
        where: {
          id: authUserId,
        },
        data: {
          password: hashPassword,
        },
      });
      await this.prisma.token.update({
        where: {
          id: getActiveToken.id,
        },
        data: {
          status: TokenStatus.EXPIRED,
        },
      });
      const payload: IMailPayload = {
        template: 'FORGOT_PASSWORD',
        payload: {
          emails: [user.email],
          data: {
            firstName: user.first_name,
            lastName: user.last_name,
          },
          subject: 'Forgot Password',
        },
      };
      this.mailClient.emit('send_email', payload);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async login(data: LoginDto) {
    try {
      const { email, password } = data;
      const checkUser = await this.prisma.user.findUnique({ where: { email } });
      if (!checkUser) {
        throw new HttpException(
          'user_not_found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (compareHash(password, checkUser.password)) {
        throw new HttpException('invalid_password', HttpStatus.CONFLICT);
      }
      const createTokenResponse = await this.tokenService.generateToken({
        userId: checkUser.id,
        role: checkUser.role,
      });
      delete checkUser.password;
      return {
        accessToken: createTokenResponse,
        user: checkUser,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async signup(data: CreateUserDto) {
    try {
      const { email, password, firstname, lastname } = data;
      const checkUser = await this.prisma.user.findUnique({ where: { email } });
      if (checkUser) {
        throw new HttpException('user_exists', HttpStatus.CONFLICT);
      }
      const hashPassword = createHash(password);
      const newUser = {} as User;
      newUser.email = data.email;
      newUser.password = hashPassword;
      newUser.first_name = firstname.trim();
      newUser.last_name = lastname.trim();
      newUser.role = Role.USER;
      const user = await this.prisma.user.create({ data: newUser });
      const createTokenResponse = await this.tokenService.generateToken({
        userId: user.id,
        role: user.role,
      });
      delete user.password;
      return {
        accessToken: createTokenResponse,
        user,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
