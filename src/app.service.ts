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
import { hashSync, compareSync } from 'bcrypt';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from './config/config.service';
import { IMailPayload } from './core/interfaces';
import { PrismaService } from './core/services/prisma.service';
import { Token, User, Role, TokenStatus } from '@prisma/client'
import { TokenService } from './core/services/token.service';

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
    return this.prisma.user.findUnique({ where: { id: userId } })
  }

  public createHash(password: string): string {
    return hashSync(password, 10);
  }

  public compare(password: string, hash: string): boolean {
    return compareSync(hash, password);
  }

  public async getDeviceById(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    return user.deviceToken;
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
              id: authUserId
            }
          },
          status: TokenStatus.ISSUED
        }
      })       
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
      const user = await this.prisma.user.findUnique({ where: { id: authUserId } });
      if (!user) {
        throw new HttpException('user_not_found', HttpStatus.NOT_FOUND);
      }
      const getActiveToken = await this.prisma.token.findFirst({
        where: {
          user: { id: authUserId },
          status: TokenStatus.ISSUED,
          token,
        }
      })
      if (!getActiveToken) {
        throw new HttpException(
          'active_token_not_found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const addExp = moment().add(
        Number(this.configService.get('tokenExp')),
        'second',
      )
      if (moment(getActiveToken.createdAt).isAfter(addExp)) {
        throw new HttpException(
          'forgot_token_expired',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      const hashPassword = this.createHash(newPassword);
      await this.prisma.user.update({
        where: {
          id: authUserId
        },
        data: {
          password: hashPassword
        }
      })
      await this.prisma.token.update({
        where: {
          id: getActiveToken.id
        },
        data: {
          status: TokenStatus.EXPIRED
        }
      })
      const payload: IMailPayload = {
        template: 'FORGOT_PASSWORD',
        payload: {
          emails: [user.email],
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
          subject: 'Forgot Password',
        },
      }
      this.mailClient.emit('send_email', payload);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async login(data: LoginDto) {
    try {
      const { email, password } = data;
      const checkUser = await this.prisma.user.findUnique({ where: { email } })
      if (!checkUser) {
        throw new HttpException(
          'user_not_found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (this.compare(password, checkUser.password)) {
        throw new HttpException('invalid_password', HttpStatus.CONFLICT);
      }
      const createTokenResponse = await this.tokenService.createToken(checkUser.id)
      delete checkUser.password
      return {
        ...createTokenResponse,
        user: checkUser,
      }
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException(e)
    }
  }

  public async signup(data: CreateUserDto) {
    try {
      const { email, password, firstname, lastname } = data;
      const checkUser = await this.prisma.user.findUnique({ where: { email } });
      if (checkUser) {
        throw new HttpException('user_exists', HttpStatus.CONFLICT);
      }
      const hashPassword = this.createHash(password);
      const newUser = {} as User;
      newUser.email = data.email;
      newUser.password = hashPassword;
      newUser.firstName = firstname.trim();
      newUser.lastName = lastname.trim();
      newUser.role = Role.USER;
      const user = await this.prisma.user.create({ data: newUser });
      const createTokenResponse = await this.tokenService.createToken(user);
      delete user.password;
      return {
        ...createTokenResponse,
        user,
      };
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
}
