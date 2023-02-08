import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { compareSync, hashSync } from 'bcrypt';
import { User, Role } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  UpdateProfileDto,
} from './dtos';
import { IMailPayload } from './types';
import { TokenService, PrismaService } from './services';
import { ChangePasswordDto } from './dtos/change-password.dto';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('FILES_SERVICE') private readonly fileClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {
    this.mailClient.connect();
    this.fileClient.connect();
    this.notificationClient.connect();
  }

  public getUserById(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  public getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async sendForgotPasswordEmail(data: ForgotPasswordDto) {
    try {
      const { email } = data;
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new HttpException('user_not_found', HttpStatus.NOT_FOUND);
      }
      const token = nanoid(10);
      this.logger.log({ token });
      await this.prisma.token.create({
        data: {
          expire: new Date(new Date().getTime() + 60000),
          token,
          user: {
            connect: {
              email,
            },
          },
        },
      });
      const payload: IMailPayload = {
        template: 'FORGOT_PASSWORD',
        payload: {
          emails: [email],
          data: {
            firstName: user.first_name,
            lastName: user.last_name,
          },
          subject: 'Forgot Password',
        },
      };
      this.mailClient.emit('send_email', payload);
    } catch (e) {
      throw e;
    }
  }

  public async changePassword(data: ChangePasswordDto) {
    try {
      const { password, token } = data;
      const checkToken = await this.prisma.token.findUnique({
        where: { token },
      });
      if (!checkToken) {
        throw new HttpException('forgot_token_not_found', HttpStatus.NOT_FOUND);
      }
      const checkExpire = moment().isAfter(checkToken.expire);
      if (!checkExpire) {
        throw new HttpException('forgot_token_expired', HttpStatus.BAD_REQUEST);
      }
      const hashPassword = hashSync(password, 10);
      await this.prisma.user.update({
        where: {
          id: checkToken.user_id,
        },
        data: {
          password: hashPassword,
        },
      });
    } catch (e) {
      throw e;
    }
  }

  public async updateProfile(data: UpdateProfileDto, userId: number) {
    try {
      const { email, firstName, lastName, phone, deviceToken, profile } = data;
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          device_token: deviceToken?.trim(),
          email: email?.trim(),
          first_name: firstName?.trim(),
          last_name: lastName?.trim(),
          phone: phone?.trim(),
          profile,
        },
      });
      delete user.password;
      if (user.profile) {
        const file = await firstValueFrom(
          this.fileClient.send(
            'get_file_by_fileid',
            JSON.stringify({
              fileId: user.profile,
            }),
          ),
        );
        return {
          ...user,
          profile: file,
        };
      }
      return user;
    } catch (e) {
      throw e;
    }
  }

  public async login(data: LoginDto) {
    try {
      const { email, password } = data;
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new HttpException('user_not_found', HttpStatus.NOT_FOUND);
      }
      if (!compareSync(password, user.password)) {
        throw new HttpException('invalid_password', HttpStatus.UNAUTHORIZED);
      }
      const accessToken = await this.tokenService.generateToken({
        userId: user.id,
        role: user.role,
      });
      delete user.password;
      if (user.profile) {
        const file = await firstValueFrom(
          this.fileClient.send(
            'get_file_by_fileid',
            JSON.stringify({
              fileId: user.profile,
            }),
          ),
        );
        return {
          accessToken,
          user: {
            ...user,
            profile: file,
          },
        };
      }
      return {
        accessToken,
        user,
      };
    } catch (e) {
      throw e;
    }
  }

  public async signup(data: CreateUserDto) {
    try {
      const { email, password, firstName, lastName, deviceToken } = data;
      const checkUser = await this.prisma.user.findUnique({ where: { email } });
      if (checkUser) {
        throw new HttpException('user_exists', HttpStatus.CONFLICT);
      }
      const hashPassword = hashSync(password, 10);
      const newUser = {} as User;
      newUser.email = data.email;
      newUser.password = hashPassword;
      newUser.first_name = firstName?.trim();
      newUser.last_name = lastName?.trim();
      newUser.device_token = deviceToken?.trim();
      newUser.role = Role.USER;
      const user = await this.prisma.user.create({ data: newUser });
      const accessToken = await this.tokenService.generateToken({
        userId: user.id,
        role: user.role,
      });
      this.notificationClient.emit(
        'send_notification',
        JSON.stringify({
          content: 'Welcome to microservices world!',
          type: 'WELCOME_NOTIFICATION',
          payload: {},
          userId: user.id,
        }),
      );
      delete user.password;
      if (user.profile) {
        const file = await firstValueFrom(
          this.fileClient.send(
            'get_file_by_fileid',
            JSON.stringify({
              fileId: user.profile,
            }),
          ),
        );
        return {
          accessToken,
          user: {
            ...user,
            profile: file,
          },
        };
      }
      return {
        accessToken,
        user,
      };
    } catch (e) {
      throw e;
    }
  }
}
