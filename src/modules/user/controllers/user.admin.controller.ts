import { Controller, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AllowedRoles } from 'src/common/decorators/auth-roles.decorator';
import { MessageKey } from 'src/common/decorators/message.decorator';

import { UserService } from 'src/modules/user/services/user.service';

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
    @AllowedRoles([Role.ADMIN])
    @MessageKey('user.success.delete')
    @Delete(':id')
    deleteUser(@Param('id') id: string): Promise<void> {
        return this.userService.softDeleteUsers([id]);
    }
}
