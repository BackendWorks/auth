import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from 'src/common/services/prisma.service';
import { Public } from 'src/core/decorators/public.decorator';
import { UserService } from 'src/modules/user/services/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @MessagePattern('getUserById')
  public async getUserById(@Payload() payload: string) {
    const data = JSON.parse(payload);
    return this.userService.getUserById(data?.id);
  }

  @MessagePattern('validateToken')
  public async getUserByAccessToken(@Payload() token: string) {
    const accessTokenSecret = this.configService.get<string>(
      'auth.accessToken.secret',
    );
    const data = await this.jwtService.verifyAsync(token, {
      secret: accessTokenSecret,
    });
    return data;
  }

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.prismaService.isHealthy(),
    ]);
  }
}
