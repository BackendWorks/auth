import { User } from '@prisma/client';

interface PaylaodType {
  emails: string[];
  subject: string;
  data: any;
}

export interface IDecodeTokenPayload {
  token: string;
}

export interface ICreateTokenPayload {
  userId: number;
}

export interface IMailPayload {
  template: keyof typeof EmailTemplates;
  payload: PaylaodType;
}

export interface IResponse<T> {
  data: T[];
}

export interface IAuthPayload {
  accessToken: string;
  user: User;
}

enum EmailTemplates {
  FORGOT_PASSWORD = 'forgot-password',
}
