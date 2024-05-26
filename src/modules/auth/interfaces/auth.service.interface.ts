import { UserLoginDto } from '../dtos/auth.login.dto';
import { AuthResponseDto } from '../dtos/auth.response.dto';
import { UserCreateDto } from '../dtos/auth.signup.dto';
import { IAuthPayload, ITokenResponse } from './auth.interface';

export interface IAuthService {
  verifyToken(accessToken: string): Promise<IAuthPayload>;
  generateTokens(user: IAuthPayload): Promise<ITokenResponse>;
  login(data: UserLoginDto): Promise<AuthResponseDto>;
  signup(data: UserCreateDto): Promise<AuthResponseDto>;
}
