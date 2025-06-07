import { registerAs } from '@nestjs/config';

export default registerAs(
    'grpc',
    (): Record<string, string> => ({
        url: process.env.GRPC_URL,
        package: process.env.GRPC_PACKAGE 
    }),
);
