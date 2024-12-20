import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';

import { PrismaService } from 'src/common/services/prisma.service';
import { AuthSignupByEmailDto, AuthSignupByPhoneDto } from 'src/modules/auth/dtos/auth.signup.dto';

import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';
import { v4 } from 'uuid';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async getUserById(userId: string): Promise<UserResponseDto> {
        return this.prismaService.user.findUnique({ where: { id: userId } });
    }

    async getUserByEmail(email: string): Promise<UserResponseDto> {
        return this.prismaService.user.findUnique({ where: { email } });
    }

    async getUserByPhone(phone: string): Promise<UserResponseDto> {
        return this.prismaService.user.findUnique({
            where: { phoneNumber: phone },
        });
    }

    async findOne(where: Prisma.UserWhereInput): Promise<User | null> {
        return this.prismaService.user.findFirst({ where });
    }

    async updateUser(userId: string, data: UserUpdateDto): Promise<User> {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            avatar,
            verification,
            verificationExpires,
            isEmailVerified,
            isPhoneVerified,
            loginAttempts,
            blockExpires,
        } = data;

        return this.prismaService.user.update({
            data: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                email,
                phoneNumber,
                avatar,
                verification,
                verificationExpires,
                isEmailVerified,
                isPhoneVerified,
                loginAttempts,
                blockExpires,
            },
            where: {
                id: userId,
            },
        });
    }

    async createUserByEmail(data: AuthSignupByEmailDto) {
        return this.prismaService.user.create({
            data: {
                email: data?.email,
                password: data?.password,
                firstName: data?.firstName.trim(),
                verification: v4(),
                role: 'USER',
                isEmailVerified: false,
                verificationExpires: addDays(new Date(), 1),
                loginAttempts: 0,
                blockExpires: null,
            },
        });
    }

    async createUserByPhone(data: AuthSignupByPhoneDto) {
        return this.prismaService.user.create({
            data: {
                email: null,
                phoneNumber: data?.phone.trim(),
                firstName: data?.firstName.trim(),
                role: 'USER',
                isPhoneVerified: false,
                verificationExpires: addDays(new Date(), 1),
                loginAttempts: 0,
                blockExpires: null,
            },
        });
    }

    async softDeleteUsers(userIds: string[]) {
        await this.prismaService.user.updateMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            data: {
                deletedAt: new Date(),
            },
        });
        return;
    }
}
