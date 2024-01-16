import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
    //
  }

  @Put()
  updateUser(@Param('id') id: number, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(data, id);
  }

  @Delete()
  deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
