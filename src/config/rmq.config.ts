import { registerAs } from '@nestjs/config';

export default registerAs(
  'rmq',
  (): Record<string, any> => ({
    uri: process.env.RABBITMQ_URL,
    files: process.env.RABBITMQ_FILES_QUEUE,
    auth: process.env.RABBITMQ_AUTH_QUEUE,
  }),
);
