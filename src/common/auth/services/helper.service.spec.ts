import { Test, TestingModule } from '@nestjs/testing';
import { HelperService } from './helper.service';
import * as bcrypt from 'bcrypt';

describe('HelperService', () => {
  let service: HelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelperService],
    }).compile();

    service = module.get<HelperService>(HelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createHash', () => {
    it('should return a hashed password', () => {
      const password = 'password123';
      const hashedPassword = bcrypt.hashSync(password, service.salt);
      expect(service.createHash(password)).toEqual(hashedPassword);
    });
  });

  describe('match', () => {
    it('should return true for matching password and hash', () => {
      const password = 'password123';
      const hash = bcrypt.hashSync(password, service.salt);
      expect(service.match(hash, password)).toBeTruthy();
    });

    it('should return false for non-matching password and hash', () => {
      const password = 'password123';
      const hash = bcrypt.hashSync(password, service.salt);
      expect(service.match(hash, 'wrongpassword')).toBeFalsy();
    });
  });
});
