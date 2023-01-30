import { compareSync, hashSync } from 'bcrypt';

export function createHash(password: string): string {
  return hashSync(password, 10);
}

export function compareHash(password: string, hash: string): boolean {
  return compareSync(hash, password);
}

export * from './prisma.service';
export * from '../../config/config.service';
export * from './token.service';
