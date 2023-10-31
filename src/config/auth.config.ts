import { registerAs } from '@nestjs/config';
import ms from 'ms';

function seconds(msValue: string): number {
  return ms(msValue) / 1000;
}

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      expirationTime: seconds(process.env.ACCESS_TOKEN_EXPIRED ?? '1h'),
    },
    cognito: {
      poolId: process.env.AWS_COGNITO_USER_POOL_ID,
      clientId: process.env.AWS_COGNITO_CLIENT_ID,
      authority: process.env.AWS_COGNITO_AUTHORITY,
    },
  }),
);
