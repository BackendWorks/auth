import { User } from '@prisma/client';
import { UpdateUserDto } from '../dtos/update.user.dto';

export interface IUserService {
  updateUser(data: UpdateUserDto, userId: number): Promise<User>;
  deleteUser(userId: number): Promise<User>;
}
