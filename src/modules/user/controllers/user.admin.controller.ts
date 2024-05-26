import { Controller, Delete, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { GenericResponseDto } from '../dtos/generic.response.dto';
import { Serialize } from 'src/decorators/serialize.decorator';

@ApiTags('admin.user')
@Controller({
  version: '1',
  path: '/admin/user',
})
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  @Serialize(GenericResponseDto)
  @AllowedRoles(Roles.Admin)
  deleteUser(@Param('id') id: number): Promise<GenericResponseDto> {
    return this.userService.softDeleteUsers([id]);
  }
}
