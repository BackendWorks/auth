import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ROLE } from '@prisma/client';

import { ROLES_DECORATOR_KEY } from '../constants/request.constant';

export const AllowedRoles = (roles: ROLE[]): CustomDecorator<string> =>
    SetMetadata(ROLES_DECORATOR_KEY, roles);
