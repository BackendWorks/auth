import type { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';

import type { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import type { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';

export interface IUserService {
    updateUser(userId: number, data: UserUpdateDto): Promise<UserResponseDto>;
    createUser(data: AuthSignupDto): Promise<UserResponseDto>;
    getUserById(userId: number): Promise<UserResponseDto>;
    getUserByEmail(email: string): Promise<UserResponseDto>;
    softDeleteUsers(userIds: number[]): Promise<void>;
}
