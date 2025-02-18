import { registerAs } from '@nestjs/config';

export default registerAs('smtp', () => ({
    host: process.env.SMTP_HOST ?? 'smtp.yandex.ru',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    user: process.env.YANDEX_EMAIL ?? '',
    password: process.env.YANDEX_PASSWORD ?? '',
    secure: process.env.SMTP_SECURE === 'true',
}));
