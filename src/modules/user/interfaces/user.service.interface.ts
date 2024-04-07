import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { UserCreateDto } from 'src/common/auth/dtos/auth.signup.dto';

export interface IUserService {
  updateUser(userId: number, data: UpdateUserDto): Promise<User>;
  createUser(data: UserCreateDto): Promise<User>;
  getUserById(userId: number): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  softDeleteUsers(userIds: number[]): Promise<Prisma.BatchPayload>;
  deleteUsers(userIds: number[]): Promise<Prisma.BatchPayload>;
}
