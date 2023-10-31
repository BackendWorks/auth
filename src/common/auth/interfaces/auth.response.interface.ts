import { User } from '@prisma/client';

export interface AuthResponse {
  accessToken: string;
  user: User;
}
