import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('Controller', () => {
  let Controller: AppController;
  let Service: AppService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    Service = module.get<AppService>(AppService);
    Controller = module.get<AppController>(AppController);
  });
});