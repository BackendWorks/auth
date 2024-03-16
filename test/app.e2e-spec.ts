import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/common/services/prisma.service';
import { AppModule } from 'src/app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(HttpStatus.OK);
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
