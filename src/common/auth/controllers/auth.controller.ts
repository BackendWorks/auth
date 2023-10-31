import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthUser } from 'src/core/decorators/auth-user.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { UserCreateDto } from '../dtos/signup.dto';
import { UserLoginDto } from '../dtos/login.dto';

@Controller('auth')
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

  @Get('me')
  public me(@AuthUser() userId: number) {
    return this.authService.me(userId);
  }
}
