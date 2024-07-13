import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { HelperHashService } from '../src/common/services/helper.hash.service';

jest.mock('bcrypt', () => ({
  genSaltSync: jest.fn().mockReturnValue('some_salt'),
  hashSync: jest.fn().mockReturnValue('hashed_value'),
  compareSync: jest.fn(),
}));

describe('HelperHashService', () => {
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelperHashService],
    }).compile();

    service = module.get<HelperHashService>(HelperHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createHash', () => {
    it('should return a hash of the password', () => {
      const password = 'password123';
      const hash = service.createHash(password);

      expect(bcrypt.genSaltSync).toHaveBeenCalled();
      expect(bcrypt.hashSync).toHaveBeenCalledWith(password, 'some_salt');
      expect(hash).toBe('hashed_value');
    });
  });

  describe('match', () => {
    it('should return true if the password matches the hash', () => {
      const hash = 'hashed_value';
      const password = 'password123';

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const isMatch = service.match(hash, password);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false if the password does not match the hash', () => {
      const hash = 'hashed_value';
      const password = 'wrong_password';

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      const isMatch = service.match(hash, password);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hash);
      expect(isMatch).toBe(false);
    });
  });
});
