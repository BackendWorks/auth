import { AuthSingupDto } from 'src/modules/auth/dtos/auth.signup.dto';

import { UserUpdateDto } from '../dtos/update.user.dto';
import { UserResponseDto } from '../dtos/user.response.dto';

export interface IUserService {
  updateUser(userId: number, data: UserUpdateDto): Promise<UserResponseDto>;
  createUser(data: AuthSingupDto): Promise<UserResponseDto>;
  getUserById(userId: number): Promise<UserResponseDto>;
  getUserByEmail(email: string): Promise<UserResponseDto>;
  softDeleteUsers(userIds: number[]): Promise<void>;
}
