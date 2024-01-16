import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CongnitoAuthService } from '../services/cognito.auth.service';
import { Public } from 'src/core/decorators/public.decorator';
import { AuthUser } from 'src/core/decorators/auth.user.decorator';
import { LoginDto } from '../dtos/cognito.login.dto';
import { CreateUserDto } from '../dtos/cognito.signup.dto';
import { GetOtpDto, VerifyDto } from '../dtos/cognito.verify.dto';

@Controller({
  version: '1',
  path: '/cognito/auth',
})
export class CongitoAuthController {
  constructor(private cognitoAuthService: CongnitoAuthService) {}

  @Public()
  @Post('/login')
  login(@Body() data: LoginDto) {
    return this.cognitoAuthService.login(data);
  }

  @Public()
  @Post('/signup')
  signup(@Body() data: CreateUserDto) {
    return this.cognitoAuthService.signup(data);
  }

  @Public()
  @Post('/verify')
  @HttpCode(200)
  verifyUser(@Body() data: VerifyDto) {
    return this.cognitoAuthService.verifySignup(data);
  }

  @Public()
  @Post('/otp')
  @HttpCode(201)
  getOtp(@Body() data: GetOtpDto) {
    return this.cognitoAuthService.getOtp(data);
  }

  @Get('/me')
  me(@AuthUser() user: User) {
    return this.cognitoAuthService.getUserByEmail(user.email);
  }
}
