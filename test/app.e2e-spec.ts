import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../src/services';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    prismaService.$disconnect();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('/signup (POST)', () => {
    return request(app.getHttpServer())
      .post('/signup')
      .send(mockUser)
      .expect(HttpStatus.CREATED);
  });

  it('/login (POST)', () => {
    const user = {
      email: mockUser.email,
      password: mockUser.password,
    };
    return request(app.getHttpServer())
      .post('/login')
      .send(user)
      .expect(HttpStatus.CREATED);
  });
});
