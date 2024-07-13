import { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';

import { UserUpdateDto } from '../dtos/user.update.dto';
import { UserResponseDto } from '../dtos/user.response.dto';

export interface IUserService {
  updateUser(userId: number, data: UserUpdateDto): Promise<UserResponseDto>;
  createUser(data: AuthSignupDto): Promise<UserResponseDto>;
  getUserById(userId: number): Promise<UserResponseDto>;
  getUserByEmail(email: string): Promise<UserResponseDto>;
  softDeleteUsers(userIds: number[]): Promise<void>;
}
