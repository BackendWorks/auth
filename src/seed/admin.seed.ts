import { PrismaClient } from '@prisma/client';

import { HelperHashService } from '../common/services/helper.hash.service';

const prisma = new PrismaClient();
const hashService = new HelperHashService();

async function seed() {
  try {
    await prisma.$connect();

    const passwordHash = hashService.createHash('admin123');

    await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        password: passwordHash,
        role: 'Admin',
        username: 'admin123',
      },
    });

    await prisma.$disconnect();
  } catch (e) {
    throw e;
  }
}

seed();
