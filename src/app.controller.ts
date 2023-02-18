import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Role, User } from '@prisma/client';
import { AppService } from './app.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dtos';
import { IAuthPayload, IAuthResponse } from './types';
import { Public, CurrentUser, Roles } from './decorators';
import { PrismaService } from './services';
import { JwtPayload } from 'jsonwebtoken';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { JwtStrategy } from './jwt.strategy';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private healthCheckService: HealthCheckService,
    private prismaService: PrismaService,
    private readonly jwt: JwtStrategy,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.$queryRaw`SELECT 1`,
    ]);
  }

  @Public()
  @Post('/login')
  login(@Body() data: LoginDto): Promise<IAuthResponse> {
    return this.appService.login(data);
  }

  @Public()
  @Post('/signup')
  signup(@Body() data: CreateUserDto): Promise<IAuthResponse> {
    return this.appService.signup(data);
  }

  @Public()
  @Post('/forgot-password')
  forgotPassword(@Body() data: ForgotPasswordDto): Promise<void> {
    return this.appService.sendForgotPasswordEmail(data);
  }

  @Public()
  @Post('/change-password')
  changePassword(@Body() data: ChangePasswordDto): Promise<void> {
    return this.appService.changePassword(data);
  }

  @Get('/user')
  async getUserDetails(@CurrentUser() user: IAuthPayload) {
    const get = await this.appService.getUserById(user.userId);
    delete get.password;
    return get;
  }

  @Roles(Role.ADMIN)
  @Put('/user/update')
  updateProfile(
    @Body() data: UpdateProfileDto,
    @CurrentUser() user: IAuthPayload,
  ): Promise<User> {
    return this.appService.updateProfile(data, user.userId);
  }

  @MessagePattern('get_user_by_userid')
  public async getUserById(@Payload() data: string): Promise<User> {
    const payload = JSON.parse(data);
    return this.appService.getUserById(payload.userId);
  }

  @MessagePattern('validate_token')
  public async getUserByToken(
    @Payload() data: string,
  ): Promise<User | JwtPayload | string> {
    const payload = JSON.parse(data);
    return this.jwt.validateToken(payload.token);
  }
}
