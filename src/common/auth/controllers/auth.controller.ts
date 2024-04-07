import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/core/decorators/auth.user.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { UserCreateDto } from '../dtos/auth.signup.dto';
import { UserLoginDto } from '../dtos/auth.login.dto';
import { IAuthPayload } from '../interfaces/auth.interface';
import { AuthJwtRefreshGuard } from '../guards/jwt.refresh.guard';

@Controller({
  version: '1',
  path: '/auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {
    //
  }

  @Public()
  @Post('login')
  public login(@Body() payload: UserLoginDto) {
    return this.authService.login(payload);
  }

  @Public()
  @Post('signup')
  public signup(@Body() payload: UserCreateDto) {
    return this.authService.signup(payload);
  }

  @Post('enable-2fa')
  public enableTwoFa(@AuthUser() user: IAuthPayload) {
    return this.authService.enableTwoFaForUser(user.id);
  }

  @Post('verify-2fa')
  public verifyAuth(
    @AuthUser() user: IAuthPayload,
    @Body() body: { token: string },
  ) {
    return this.authService.verifyTwoFactorAuth(user.id, body.token);
  }

  @Public()
  @UseGuards(AuthJwtRefreshGuard)
  @Get('refresh-token')
  public refreshTokens(@AuthUser() user: IAuthPayload) {
    return this.authService.generateTokens(user);
  }
}
