import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HelperHashService {
  private readonly salt: string;

  constructor() {
    this.salt = bcrypt.genSaltSync();
  }

  public createHash(password: string): string {
    return bcrypt.hashSync(password, this.salt);
  }

  public match(hash: string, password: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
