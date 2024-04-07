import { UserLoginDto } from '../dtos/auth.login.dto';
import { UserCreateDto } from '../dtos/auth.signup.dto';
import {
  IAuthPayload,
  IAuthResponse,
  ITokenResponse,
  ITwoFaResponse,
} from './auth.interface';

export interface IAuthService {
  verifyToken(accessToken: string): Promise<IAuthPayload>;
  generateTokens(user: IAuthPayload): Promise<ITokenResponse>;
  login(data: UserLoginDto): Promise<IAuthResponse>;
  signup(data: UserCreateDto): Promise<IAuthResponse>;
  enableTwoFaForUser(userId: number): Promise<ITwoFaResponse>;
  verifyTwoFactorAuth(userId: number, token: string): Promise<boolean>;
}
