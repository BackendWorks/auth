import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AuthUser } from 'src/common/decorators/auth.decorator';
import { AllowedRoles } from 'src/common/decorators/role.decorator';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';

import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update.dto';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('auth.user')
@Controller({
    version: '1',
    path: '/user',
})
export class AuthUserController {
    constructor(private readonly userService: UserService) {}

    @ApiBearerAuth('accessToken')
    @Put()
    @AllowedRoles([Role.USER, Role.ADMIN])
    updateUser(
        @AuthUser() user: IAuthPayload,
        @Body() data: UserUpdateDto,
    ): Promise<UserResponseDto> {
        return this.userService.updateUser(user.id, data);
    }

    @ApiBearerAuth('accessToken')
    @Get('profile')
    @AllowedRoles([Role.USER, Role.ADMIN])
    getUserInfo(@AuthUser() user: IAuthPayload): Promise<UserResponseDto> {
        return this.userService.getUserById(user.id);
    }

    @ApiBearerAuth('accessToken')
    @Get('bulk')
    @AllowedRoles([Role.USER, Role.ADMIN])
    async getUsersBulk(@Body('userIds') userIds: string[]): Promise<UserResponseDto[]> {
        return this.userService.getUsersByIds(userIds);
    }
}
