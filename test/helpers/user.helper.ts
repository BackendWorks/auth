import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const createMockUser = (overrides?: Partial<User>): User => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    patronymic: faker.person.middleName(),
    phoneNumber: faker.phone.number(),
    avatar: faker.image.avatar(),
    isEmailVerified: faker.datatype.boolean(),
    isPhoneVerified: faker.datatype.boolean(),
    verification: faker.string.uuid(),
    verificationExpires: faker.date.future(),
    loginAttempts: faker.number.int({ min: 0, max: 10 }),
    blockExpires: null,
    role: faker.helpers.arrayElement(['USER', 'ADMIN']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    companyId: faker.string.uuid(),
    ...overrides,
});
