import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { IUserService } from '../interfaces/user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly prismaService: PrismaService) {
    //
  }

  updateUser(data: UpdateUserDto, userId: number) {
    const { firstName, lastName, email, phone, role } = data;
    return this.prismaService.user.update({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email,
        phone,
        role,
      },
      where: {
        id: userId,
      },
    });
  }

  getUserById(userId: number) {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  deleteUser(userId: number) {
    return this.prismaService.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
