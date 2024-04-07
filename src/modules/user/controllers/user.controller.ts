import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { AuthUser } from 'src/core/decorators/auth.user.decorator';
import { IAuthPayload } from 'src/common/auth/interfaces/auth.interface';

@Controller({
  version: '1',
  path: '/user',
})
export class UserController {
  constructor(private readonly userService: UserService) {
    //
  }

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
