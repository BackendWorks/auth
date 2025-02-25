import { UserResponseDto } from '../dtos/user.response.dto';
import { UserUpdateDto } from '../dtos/user.update.dto';
import { UserBulkResponseDto } from '../dtos/user-bulk-response.dto';

import { AuthSignupDto } from '@/modules/auth/dtos/auth.signup.dto';

export interface IUserService {
    updateUser(userId: string, data: UserUpdateDto): Promise<UserResponseDto>;
    createUser(data: AuthSignupDto): Promise<UserResponseDto>;
    getUserById(userId: string): Promise<UserResponseDto>;
    getUserByEmail(email: string): Promise<UserResponseDto>;
    getUserByUserName(userName: string): Promise<UserResponseDto>;
    softDeleteUsers(userIds: string[]): Promise<UserBulkResponseDto>;
}
