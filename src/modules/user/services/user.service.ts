import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { UserCreateDto } from 'src/common/auth/dtos/auth.signup.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {
    //
  }

  public async updateUser(userId: number, data: UpdateUserDto): Promise<User> {
    const { firstName, lastName, email, phone } = data;
    return this.prismaService.user.update({
      data: {
        first_name: firstName?.trim(),
        last_name: lastName?.trim(),
        email,
        phone,
      },
      where: {
        id: userId,
      },
    });
  }

  public async updateUserTwoFaSecret(userId: number, secret: string) {
    return this.prismaService.user.update({
      data: {
        two_factor_secret: secret,
      },
      where: {
        id: userId,
      },
    });
  }

  public async createUser(data: UserCreateDto): Promise<User> {
    const role = await this.prismaService.roles.findFirst({
      where: {
        name: 'User',
      },
    });
    if (!role) {
      throw new NotFoundException('roleNotFound');
    }
    return this.prismaService.user.create({
      data: {
        email: data?.email,
        password: data?.password,
        first_name: data?.firstName.trim(),
        last_name: data?.lastName.trim(),
        role: {
          connect: {
            id: role.id,
          },
        },
        username: data?.username.trim(),
      },
    });
  }

  public async getUserById(userId: number): Promise<User> {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  public async softDeleteUsers(
    userIds: number[],
  ): Promise<Prisma.BatchPayload> {
    return this.prismaService.user.updateMany({
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
  }

  public async deleteUsers(userIds: number[]): Promise<Prisma.BatchPayload> {
    return this.prismaService.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }
}
