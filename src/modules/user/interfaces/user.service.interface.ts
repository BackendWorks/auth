import { UpdateUserDto } from '../dtos/update.user.dto';
import { UserCreateDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { GenericResponseDto } from '../dtos/generic.response.dto';

export interface IUserService {
  updateUser(userId: number, data: UpdateUserDto): Promise<UserResponseDto>;
  createUser(data: UserCreateDto): Promise<UserResponseDto>;
  getUserById(userId: number): Promise<UserResponseDto>;
  getUserByEmail(email: string): Promise<UserResponseDto>;
  softDeleteUsers(userIds: number[]): Promise<GenericResponseDto>;
  deleteUsers(userIds: number[]): Promise<GenericResponseDto>;
}
