import { Injectable } from '@nestjs/common';

import { UserResponseDto } from '../dtos/user.response.dto';
import { IUserService } from '../interfaces/user-service.interface';
import { UserUpdateDto } from '../dtos/user.update.dto';
import { UserBulkResponseDto } from '../dtos/user-bulk-response.dto';

import { AuthSignupDto } from '@/modules/auth/dtos/auth.signup.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class UserService implements IUserService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getUserById(userId: string): Promise<UserResponseDto> {
        return this.databaseService.user.findUnique({
            where: { id: userId },
        });
    }

    async getUserByEmail(email: string): Promise<UserResponseDto> {
        return this.databaseService.user.findUnique({
            where: { email },
        });
    }

    async getUserByUserName(userName: string): Promise<UserResponseDto> {
        return this.databaseService.user.findUnique({
            where: { username: userName },
        });
    }

    async updateUser(
        userId: string,
        data: UserUpdateDto,
    ): Promise<UserResponseDto> {
        const { firstName, lastName, email, phone, avatar, username } = data;
        return this.databaseService.user.update({
            where: { id: userId },
            data: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                email,
                phone,
                avatar,
                username: username?.trim(),
            },
        });
    }

    async createUser(data: AuthSignupDto): Promise<UserResponseDto> {
        const { email, password, firstName, lastName, username } = data;
        return this.databaseService.user.create({
            data: {
                email,
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim(),
                role: 'User',
            },
        });
    }

    async softDeleteUsers(userIds: string[]): Promise<UserBulkResponseDto> {
        await this.databaseService.user.updateMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
        return {
            count: userIds.length,
        };
    }
}
