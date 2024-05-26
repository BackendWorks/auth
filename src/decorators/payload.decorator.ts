import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TransformMessagePayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const message = ctx.switchToRpc().getData();
    try {
      return JSON.parse(message);
    } catch (error) {
      throw new Error('Invalid JSON payload');
    }
  },
);
