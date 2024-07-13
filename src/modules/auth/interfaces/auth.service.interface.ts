import { AuthLoginDto } from '../dtos/auth.login.dto';
import { AuthResponseDto } from '../dtos/auth.response.dto';
import { AuthSignupDto } from '../dtos/auth.signup.dto';
import { IAuthPayload, ITokenResponse } from './auth.interface';

export interface IAuthService {
  verifyToken(accessToken: string): Promise<IAuthPayload>;
  generateTokens(user: IAuthPayload): Promise<ITokenResponse>;
  login(data: AuthLoginDto): Promise<AuthResponseDto>;
  signup(data: AuthSignupDto): Promise<AuthResponseDto>;
}
