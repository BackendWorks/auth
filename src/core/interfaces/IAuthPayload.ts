import { User } from "@prisma/client";

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}
