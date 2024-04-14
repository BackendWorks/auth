import { PrismaClient } from '@prisma/client';
import { PermissionModules } from '../../app/app.enum';

async function seedRolesAndPermissions() {
  try {
    const prismaClient = new PrismaClient();
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
        return prismaClient.roles.upsert({
          where: {
            name: role.name,
          },
          update: {
            name: role.name,
            permissions: {
              create: role.permissions.map((item) => {
                return {
                  module: item,
                };
              }),
            },
          },
          create: {
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
    console.log(err);
    throw err;
  }

  return;
}

seedRolesAndPermissions();
