import { Reflector } from '@nestjs/core';
import { Roles } from '@prisma/client';

export const AllowedRoles = Reflector.createDecorator<Roles[]>();
