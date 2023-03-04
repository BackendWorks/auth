import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateUserDto, LoginDto } from './dtos';
import { CurrentUser, Public } from './decorators';
import { JwtService, PrismaService } from './services';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { GetOtpDto, VerifyDto } from './dtos/verify.dto';
import { User } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private healthCheckService: HealthCheckService,
    private prismaService: PrismaService,
    private jwt: JwtService,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.isHealthy(),
    ]);
  }

  @Public()
  @Post('/login')
  login(@Body() data: LoginDto) {
    return this.appService.login(data);
  }

  @Public()
  @Post('/signup')
  signup(@Body() data: CreateUserDto) {
    return this.appService.signup(data);
  }

  @Public()
  @Post('/verify')
  @HttpCode(200)
  verifyUser(@Body() data: VerifyDto) {
    return this.appService.verifySignup(data);
  }

  @Public()
  @Post('/otp')
  @HttpCode(201)
  getOtp(@Body() data: GetOtpDto) {
    return this.appService.getOtp(data);
  }

  @Get('/me')
  me(@CurrentUser() user: User) {
    return this.appService.me(user.email);
  }

  @MessagePattern('get_user_by_id')
  public async getUserById(@Payload() data: string): Promise<User> {
    const payload = JSON.parse(data);
    return this.appService.getUserById(payload.id);
  }

  @MessagePattern('validate_token')
  public async getUserByAccessToken(@Payload() token: string) {
    return this.jwt.validateToken(token);
  }
}
