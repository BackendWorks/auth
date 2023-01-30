import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto, ForgotPasswordDto, LoginDto } from './core/dtos';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IGetUserById, IAuthPayload } from './types';
import { Public, CurrentUser } from './core/decorators';
import { Token, User } from '@prisma/client';
import { JwtAuthGuard, RolesGuard } from './core/guards';
import { TokenService } from './core/services';
import { JwtPayload } from 'jsonwebtoken';

@Controller()
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class AppController {
  constructor(
    private appService: AppService,
    private tokenService: TokenService,
  ) {}

  @MessagePattern('get_user_by_id')
  public async getUserById(@Payload() data: string): Promise<IGetUserById> {
    return this.appService.getUserById(JSON.parse(data).userId);
  }

  @MessagePattern('get_device_id')
  public async getDeviceById(@Payload() data: string): Promise<string> {
    return this.appService.getDeviceById(JSON.parse(data).userId);
  }

  @MessagePattern('get_user_from_token')
  public async getUserByToken(
    @Payload() data: string,
  ): Promise<User | JwtPayload | string> {
    return this.tokenService.validateToken(JSON.parse(data).token);
  }

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

  @Get('/forgot-password')
  getForgotPassword(@CurrentUser() auth: number): Promise<Token> {
    return this.appService.getForgotPasswordToken(auth);
  }

  @Put('/change-password')
  changePassword(
    @Body() data: ForgotPasswordDto,
    @CurrentUser() auth: number,
  ): Promise<void> {
    return this.appService.changePassword(data, auth);
  }
}
