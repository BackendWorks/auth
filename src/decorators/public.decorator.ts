import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from 'src/app/app.constant';

export const Public = (): CustomDecorator<string> =>
  SetMetadata(PUBLIC_ROUTE_KEY, true);
