import { PrismaClient } from '@prisma/client';

async function removeRoles(): Promise<void> {
  try {
    const prismaClient = new PrismaClient();
    await prismaClient.permissions.deleteMany();
    await prismaClient.roles.deleteMany();
  } catch (err: any) {
    console.log(err);
    throw err;
  }

  return;
}

removeRoles();
