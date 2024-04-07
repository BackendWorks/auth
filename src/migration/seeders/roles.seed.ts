import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Command } from 'nestjs-command';
import { PermissionModules } from 'src/app/app.constant';

@Injectable()
export class RolesSeed {
  private prismaClient: PrismaClient;
  constructor() {
    this.prismaClient = new PrismaClient();
  }
  @Command({
    command: 'seed:role',
    describe: 'seed roles',
  })
  async seedRolesAndPermissions() {
    try {
      const rolesData = [
        {
          name: 'Admin',
          permissions: [
            PermissionModules.Admin,
            PermissionModules.Users,
            PermissionModules.Post,
          ],
        },
        {
          name: 'User',
          permissions: [PermissionModules.Users, PermissionModules.Post],
        },
      ];
      await Promise.all(
        rolesData.map((role) => {
          return this.prismaClient.roles.create({
            data: {
              name: role.name,
              permissions: {
                create: role.permissions.map((item) => {
                  return {
                    module: item,
                  };
                }),
              },
            },
          });
        }),
      );
    } catch (err: any) {
      throw err;
    }

    return;
  }

  @Command({
    command: 'rollback:role',
    describe: 'rollback roles',
  })
  async remove(): Promise<void> {
    try {
      await this.prismaClient.roles.deleteMany();
    } catch (err: any) {
      throw new Error(err.message);
    }

    return;
  }
}
