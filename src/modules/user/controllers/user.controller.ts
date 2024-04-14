import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { AuthUser } from 'src/core/decorators/auth.user.decorator';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller({
  version: '1',
  path: '/users',
})
export class UserController {
  constructor(private readonly userService: UserService) {
    //
  }

  @Put()
  updateUser(@Param('id') id: number, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(id, data);
  }

  @Get('profile')
  getProfileInfo(@AuthUser() user: IAuthPayload) {
    return this.userService.getUserById(user.id);
  }
}
