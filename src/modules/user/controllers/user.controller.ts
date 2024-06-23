import { Body, Controller, Get, Put } from '@nestjs/common';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { TransformMessagePayload } from 'src/decorators/payload.decorator';
import { AuthUser } from 'src/decorators/auth.decorator';
import { AllowedRoles } from 'src/decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { Serialize } from 'src/decorators/serialize.decorator';

import { UserResponseDto } from '../dtos/user.response.dto';
import { UserService } from '../services/user.service';
import { UserUpdateDto } from '../dtos/update.user.dto';

@ApiTags('user.user')
@Controller({
  version: '1',
  path: '/user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('getUserById')
  public async getUserById(
    @TransformMessagePayload() payload: Record<string, any>,
  ) {
    return this.userService.getUserById(payload.userId);
  }

  @MessagePattern('getUserByEmail')
  public async getUserByEmail(
    @TransformMessagePayload() payload: Record<string, any>,
  ) {
    return this.userService.getUserByEmail(payload.userName);
  }

  @MessagePattern('getUserByUserName')
  public async getUserByUserName(
    @TransformMessagePayload() payload: Record<string, any>,
  ) {
    return this.userService.getUserByUserName(payload.userName);
  }

  @ApiBearerAuth('accessToken')
  @Put()
  @Serialize({ serialization: UserResponseDto })
  @AllowedRoles([Roles.User, Roles.Admin])
  updateUser(
    @AuthUser() user: IAuthPayload,
    @Body() data: UserUpdateDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(user.id, data);
  }

  @ApiBearerAuth('accessToken')
  @Get('profile')
  @Serialize({ serialization: UserResponseDto })
  @AllowedRoles([Roles.User, Roles.Admin])
  getUserInfo(@AuthUser() user: IAuthPayload): Promise<UserResponseDto> {
    return this.userService.getUserById(user.id);
  }
}
