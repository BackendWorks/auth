import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
    brokers: process.env.KAFKA_BROKERS?.split(',') || [],
    clientId: process.env.KAFKA_CLIENT_ID,
    consumer: {
        groupId: process.env.KAFKA_CONSUMER_GROUP,
    },
    admin: {
        clientId: process.env.KAFKA_ADMIN_CLIENT_ID,
    },
}));
