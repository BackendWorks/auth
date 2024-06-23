import { registerAs } from '@nestjs/config';
import ms from 'ms';

function seconds(msValue: string): number {
  return ms(msValue) / 1000;
}

export default registerAs(
  'auth',
  (): Record<string, unknown> => ({
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      expirationTime: seconds(process.env.ACCESS_TOKEN_EXPIRED ?? '1d'),
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET_KEY,
      expirationTime: seconds(process.env.REFRESH_TOKEN_EXPIRED ?? '7d'),
    },
  }),
);
