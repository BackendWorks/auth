import { Roles } from '@prisma/client';

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthPayload {
  id: number;
  role: string;
  device_token: string;
}

export interface IGetPermissionFromRolePayload {
  role: Roles;
  module: string;
}

export enum TokenType {
  ACCESS_TOKEN = 'AccessToken',
  REFRESH_TOKEN = 'RefreshToken',
}
