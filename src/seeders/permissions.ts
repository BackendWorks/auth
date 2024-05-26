import { PermissionType, PrismaClient, Roles } from '@prisma/client';

const prisma = new PrismaClient();

enum Modules {
  User = 'User',
  Files = 'Files',
  Post = 'Post',
  Notification = 'Notification',
}

async function populatePermissionData() {
  try {
    console.log('>>>> Removing permissions data in database');
    await prisma.permission.deleteMany();
    console.log('>>>> Seeding permissions data in database');
    const permissionData = [
      {
        modules: [
          Modules.User,
          Modules.Files,
          Modules.Notification,
          Modules.Post,
        ],
        permissionType: PermissionType.Admin,
        role: Roles.Admin,
      },
      {
        modules: [Modules.User, Modules.Files, Modules.Notification],
        permissionType: PermissionType.Read,
        role: Roles.User,
      },
      {
        modules: [Modules.User, Modules.Files, Modules.Notification],
        permissionType: PermissionType.Write,
        role: Roles.User,
      },
      {
        modules: [Modules.Post],
        permissionType: PermissionType.Admin,
        role: Roles.User,
      },
    ];

    for (const permission of permissionData) {
      for (const module of permission.modules) {
        await prisma.permission.create({
          data: {
            module,
            permission_type: permission.permissionType,
            role: permission.role,
          },
        });
      }
    }

    console.log('>>>> Permissions data are seeded');
  } catch (err) {
    console.log('>>>> Error seeding permissions data');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

populatePermissionData();
