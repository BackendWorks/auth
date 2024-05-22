import { User } from '@prisma/client';

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse extends ITokenResponse {
  user: User;
}

export interface IAuthPayload {
  id: number;
  role: string;
  device_token: string;
}
