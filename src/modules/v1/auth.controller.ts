import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtService } from '../../services';
import {
  CreateUserDto,
  CurrentUser,
  GetOtpDto,
  LoginDto,
  Public,
  VerifyDto,
} from '../../core';

@Controller('v1')
export class AuthController {
  constructor(private authService: AuthService, private jwt: JwtService) {}

  @Public()
  @Post('/login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Public()
  @Post('/signup')
  signup(@Body() data: CreateUserDto) {
    return this.authService.signup(data);
  }

  @Public()
  @Post('/verify')
  @HttpCode(200)
  verifyUser(@Body() data: VerifyDto) {
    return this.authService.verifySignup(data);
  }

  @Public()
  @Post('/otp')
  @HttpCode(201)
  getOtp(@Body() data: GetOtpDto) {
    return this.authService.getOtp(data);
  }

  @Get('/me')
  me(@CurrentUser() user: User) {
    return this.authService.me(user.email);
  }

  @MessagePattern('get_user_by_id')
  public async getUserById(@Payload() data: string): Promise<User> {
    const payload = JSON.parse(data);
    return this.authService.getUserById(payload.id);
  }

  @MessagePattern('validate_token')
  public async getUserByAccessToken(@Payload() token: string) {
    return this.jwt.validateToken(token);
  }
}
