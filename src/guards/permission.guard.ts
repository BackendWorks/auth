import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionType, Roles } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;

    const userPermissions = await this.prismaService.permission.findMany({
      where: {
        role: user.role,
        module: 'User',
      },
    });

    const hasPermission = (permissionType: PermissionType) => {
      return userPermissions.some(
        (permission) => permission.permission_type === permissionType,
      );
    };

    let permissionGranted = false;

    switch (method) {
      case 'GET':
        permissionGranted =
          hasPermission(PermissionType.Read) ||
          hasPermission(PermissionType.Admin);
        break;
      case 'POST':
      case 'PUT':
        permissionGranted =
          hasPermission(PermissionType.Write) ||
          hasPermission(PermissionType.Admin);
        break;
      case 'DELETE':
        permissionGranted = hasPermission(PermissionType.Admin);
        break;
      default:
        throw new ForbiddenException('notHaveEnoughPermissions');
    }

    if (!permissionGranted) {
      throw new ForbiddenException('notHaveEnoughPermissions');
    }

    return true;
  }
}
