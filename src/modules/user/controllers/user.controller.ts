import {
    Body,
    Controller,
    Delete,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Put,
} from '@nestjs/common';
import { ROLE } from '@prisma/client';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import { UserUpdateDto } from '../dtos/user.update.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { UserBulkResponseDto } from '../dtos/user-bulk-response.dto';
import { UserBulkRequestDto } from '../dtos/user-bulk-request.dto';

import { MessageKey } from '@/common/decorators/message.decorator';
import { AllowedRoles } from '@/common/decorators/request-role.decorator';
import { SwaggerResponse } from '@/common/dtos/base-response.dto';

@ApiTags('users')
@Controller({
    version: '1',
    path: '/user',
})
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Put(':id')
    @ApiBearerAuth('accessToken')
    @MessageKey('user.success.updated')
    @ApiOperation({ summary: 'Update user details' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User updated successfully',
        type: SwaggerResponse(UserResponseDto),
    })
    async updateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UserUpdateDto,
    ): Promise<UserResponseDto> {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Delete('batch')
    @ApiBearerAuth('accessToken')
    @MessageKey('user.success.deleted')
    @AllowedRoles([ROLE.Admin])
    @ApiOperation({ summary: 'Batch delete users' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users deleted successfully',
        type: SwaggerResponse(UserBulkResponseDto),
    })
    async softDeleteUsers(
        @Body() body: UserBulkRequestDto,
    ): Promise<UserBulkResponseDto> {
        return this.userService.softDeleteUsers(body.ids);
    }
}
