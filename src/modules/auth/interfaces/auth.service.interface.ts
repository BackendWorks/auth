import { IAuthPayload, ITokenResponse } from './auth.interface';
import { AuthLoginDto } from 'src/modules/auth/dtos/auth.login.dto';
import { AuthResponseDto, SignUpByEmailResponseDto } from 'src/modules/auth/dtos/auth.response.dto';
import { AuthSignupByEmailDto } from 'src/modules/auth/dtos/auth.signup.dto';

export interface IAuthService {
    verifyToken(accessToken: string): Promise<IAuthPayload>;
    generateTokens(user: IAuthPayload): Promise<ITokenResponse>;
    login(data: AuthLoginDto): Promise<AuthResponseDto>;
    signupByEmail(data: AuthSignupByEmailDto): Promise<SignUpByEmailResponseDto>;
}
