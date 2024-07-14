import { registerAs } from '@nestjs/config';

export default registerAs(
  'rmq',
  (): Record<string, unknown> => ({
    uri: process.env.RABBITMQ_URL,
    auth: process.env.RABBITMQ_AUTH_QUEUE,
  }),
);
