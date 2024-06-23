import { Controller, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { Serialize } from 'src/decorators/serialize.decorator';

import { UserService } from '../services/user.service';

@ApiTags('admin.user')
@Controller({
  version: '1',
  path: '/admin/user',
})
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('accessToken')
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @Serialize({ message: 'user.userDeleted' })
  @Delete(':id')
  @AllowedRoles([Roles.Admin])
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.softDeleteUsers([id]);
  }
}
