import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { AuthUser } from 'src/decorators/auth.user.decorator';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller({
  version: '1',
  path: '/user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put()
  updateUser(@Param('id') id: number, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(id, data);
  }

  @Delete()
  deleteUser(@Param('id') id: number) {
    return this.userService.softDeleteUsers([id]);
  }

  @Get()
  getProfileInfo(@AuthUser() user: IAuthPayload) {
    return this.userService.getUserById(user.id);
  }
}
