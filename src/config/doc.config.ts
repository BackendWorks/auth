import { registerAs } from '@nestjs/config';

export default registerAs(
  'doc',
  (): Record<string, unknown> => ({
    name: `${process.env.APP_NAME} APIs Specification`,
    description: `${process.env.APP_NAME} APIs Description`,
    version: '1.0',
    prefix: '/docs',
  }),
);
