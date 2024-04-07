import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TransformPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const data = ctx.switchToRpc().getData();
    return JSON.parse(JSON.stringify(data));
  },
);
