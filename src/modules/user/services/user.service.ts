import { Injectable } from '@nestjs/common';
import { AuthSignupDto } from 'src/modules/auth/dtos/auth.signup.dto';

import { PrismaService } from '../../../common/services/prisma.service';
import { UserResponseDto } from '../dtos/user.response.dto';
import { UserUpdateDto } from '../dtos/user.update.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserById(userId: string): Promise<UserResponseDto> {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async getUserByUserName(userName: string): Promise<UserResponseDto> {
    return this.prismaService.user.findUnique({
      where: { username: userName },
    });
  }

  async updateUser(userId: string, data: UserUpdateDto) {
    const { firstName, lastName, email, phone, avatar } = data;
    return this.prismaService.user.update({
      data: {
        first_name: firstName?.trim(),
        last_name: lastName?.trim(),
        email,
        phone,
        avatar,
      },
      where: {
        id: userId,
      },
    });
  }

  async createUser(data: AuthSignupDto) {
    return this.prismaService.user.create({
      data: {
        email: data?.email,
        password: data?.password,
        first_name: data?.firstName.trim(),
        last_name: data?.lastName.trim(),
        role: 'User',
        username: data?.username.trim(),
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
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    return;
  }
}
