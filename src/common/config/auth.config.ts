import { registerAs } from '@nestjs/config';

function parseTimeToSeconds(time: string): number {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1));

    switch (unit.toLowerCase()) {
        case 'd':
            return value * 24 * 60 * 60;
        case 'h':
            return value * 60 * 60;
        case 'm':
            return value * 60;
        case 's':
            return value;
        default:
            throw new Error(
                'Invalid time unit. Use d (days), h (hours), m (minutes), or s (seconds)',
            );
    }
}

export default registerAs(
    'auth',
    (): Record<string, unknown> => ({
        accessToken: {
            secret: process.env.ACCESS_TOKEN_SECRET_KEY,
            expirationTime: parseTimeToSeconds(
                process.env.ACCESS_TOKEN_EXPIRED ?? '1d',
            ),
        },
    }),
);
