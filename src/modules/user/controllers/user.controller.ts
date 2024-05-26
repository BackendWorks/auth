import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { TransformMessagePayload } from 'src/decorators/payload.decorator';
import { AuthUser } from 'src/decorators/auth.decorator';
import { AllowedRoles } from 'src/decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { UserResponseDto } from '../dtos/user.response.dto';
import { Serialize } from 'src/decorators/serialize.decorator';

@ApiTags('user')
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

  @ApiBearerAuth('accessToken')
  @Put(':id')
  @Serialize(UserResponseDto)
  @AllowedRoles([Roles.User, Roles.Admin])
  updateUser(
    @Param('id') id: number,
    @Body() data: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(id, data);
  }

  @ApiBearerAuth('accessToken')
  @Get('profile')
  @Serialize(UserResponseDto)
  @AllowedRoles([Roles.User, Roles.Admin])
  getUserInfo(@AuthUser() user: IAuthPayload): Promise<UserResponseDto> {
    return this.userService.getUserById(user.id);
  }
}
