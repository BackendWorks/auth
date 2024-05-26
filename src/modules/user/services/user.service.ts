import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { UserCreateDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { GenericResponseDto } from '../dtos/generic.response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUser(
    userId: number,
    data: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const { firstName, lastName, email, phone, profilePicture } = data;
    return this.prismaService.user.update({
      data: {
        first_name: firstName?.trim(),
        last_name: lastName?.trim(),
        email,
        phone,
        profile_picture: profilePicture,
      },
      where: {
        id: userId,
      },
    });
  }

  async createUser(data: UserCreateDto): Promise<UserResponseDto> {
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

  async getUserById(userId: number): Promise<UserResponseDto> {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async softDeleteUsers(userIds: number[]): Promise<GenericResponseDto> {
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
    return {
      status: true,
      message: 'userDeleted',
    };
  }

  async deleteUsers(userIds: number[]): Promise<GenericResponseDto> {
    await this.prismaService.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
    return {
      status: true,
      message: 'userDeleted',
    };
  }
}
