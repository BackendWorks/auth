import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AllowedRoles } from 'src/common/decorators/role.decorator';

import { UserService } from 'src/modules/user/services/user.service';
import { UserRoleUpdateDto } from 'src/modules/user/dtos/user.role.update.dto';
import { CompanyRequestUpdateDto } from 'src/modules/company/dtos/company.request.update.dto';
import { CompanyRequestService } from 'src/modules/company/services/company-request.service';

@ApiTags('admin.user')
@Controller({
    version: '1',
    path: '/admin/user',
})
export class AdminUserController {
    constructor(
        private readonly userService: UserService,
        private readonly companyRequestService: CompanyRequestService,
    ) {}

    @ApiBearerAuth('accessToken')
    @ApiParam({
        name: 'id',
        type: 'string',
    })
    @Delete(':id')
    @AllowedRoles([Role.ADMIN])
    deleteUser(@Param('id') id: string): Promise<void> {
        return this.userService.softDeleteUsers([id]);
    }

    @ApiBearerAuth('accessToken')
    @ApiParam({
        name: 'id',
        type: 'string',
    })
    @Put(':id/role')
    @AllowedRoles([Role.ADMIN])
    updateUserRole(@Param('id') id: string, @Body() { role }: UserRoleUpdateDto) {
        return this.userService.updateUserRole(id, role);
    }

    @ApiBearerAuth('accessToken')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'The ID of the user to remove from the company',
    })
    @Delete(':id/company')
    @AllowedRoles([Role.ADMIN])
    async removeUserFromCompany(@Param('id') userId: string) {
        return this.userService.removeUserFromCompany(userId);
    }

    @ApiBearerAuth('accessToken')
    @ApiParam({
        name: 'requestId',
        type: 'string',
    })
    @Put('request/:requestId/status')
    @AllowedRoles([Role.ADMIN])
    async updateCompanyRequestStatus(
        @Param('requestId') requestId: string,
        @Body() dto: CompanyRequestUpdateDto,
    ) {
        return this.companyRequestService.updateRequestStatus(requestId, dto);
    }
}
