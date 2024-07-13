import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { TransformMessagePayload } from 'src/decorators/payload.decorator';
import { AuthUser } from 'src/decorators/auth.decorator';

import { AuthResponseDto } from '../dtos/auth.response.dto';
import { AuthJwtRefreshGuard } from '../../../guards/jwt.refresh.guard';
import { IAuthPayload } from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto } from '../dtos/auth.login.dto';
import { AuthSignupDto } from '../dtos/auth.signup.dto';

@ApiTags('auth')
@Controller({
  version: '1',
  path: '/auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('validateToken')
  public async getUserByAccessToken(
    @TransformMessagePayload() payload: Record<string, string>,
  ) {
    return this.authService.verifyToken(payload.token);
  }

  @Public()
  @Post('login')
  public login(@Body() payload: AuthLoginDto): Promise<AuthResponseDto> {
    return this.authService.login(payload);
  }

  @Public()
  @Post('signup')
  public signup(@Body() payload: AuthSignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(payload);
  }

  @Public()
  @UseGuards(AuthJwtRefreshGuard)
  @Get('refresh-token')
  public refreshTokens(@AuthUser() user: IAuthPayload) {
    return this.authService.generateTokens(user);
  }
}
