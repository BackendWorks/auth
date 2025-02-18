import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TransformMessagePayload = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const raw = ctx.switchToRpc().getData();
        if (typeof raw === 'object') {
            return raw;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            throw new Error('Invalid JSON payload');
        }
    },
);
