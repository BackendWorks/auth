import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';
import { ROLES_DECORATOR_KEY } from '../constants/request.constant';


export const AllowedRoles = (roles: Role[]) => SetMetadata(ROLES_DECORATOR_KEY, roles);