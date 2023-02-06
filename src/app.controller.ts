import { Body, Controller, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { AppService } from './app.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dtos';
import { IAuthPayload } from './types';
import { Public, CurrentUser } from './decorators';
import { TokenService } from './services';
import { JwtPayload } from 'jsonwebtoken';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private tokenService: TokenService,
  ) {}

  @Public()
  @Post('/login')
  login(@Body() data: LoginDto): Promise<IAuthPayload> {
    return this.appService.login(data);
  }

  @Public()
  @Post('/signup')
  signup(@Body() data: CreateUserDto): Promise<IAuthPayload> {
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

  @Put('/user/update')
  updateProfile(
    @Body() data: UpdateProfileDto,
    @CurrentUser() userId: number,
  ): Promise<User> {
    return this.appService.updateProfile(data, userId);
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
    return this.tokenService.validateToken(payload.token);
  }
}
