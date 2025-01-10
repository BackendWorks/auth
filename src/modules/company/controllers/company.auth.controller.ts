import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AuthUser } from 'auth/src/common/decorators/auth.decorator';
import { AllowedRoles } from 'auth/src/common/decorators/role.decorator';
import { IAuthPayload } from 'auth/src/modules/auth/interfaces/auth.interface';
import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';
import { CompanyService } from 'src/modules/company/services/company.service';

@ApiTags('auth.company')
@Controller({
    version: '1',
    path: '/company',
})
export class AuthCompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @ApiBearerAuth('accessToken')
    @Post()
    @AllowedRoles([Role.USER, Role.ADMIN])
    createCompany(
        @AuthUser() user: IAuthPayload,
        @Body() data: CompanyCreateDto,
    ): Promise<CompanyResponseDto> {
        return this.companyService.createCompany(user.id, data);
    }

    @ApiBearerAuth('accessToken')
    @Put()
    @AllowedRoles([Role.USER, Role.ADMIN])
    updateCompany(
        @AuthUser() user: IAuthPayload,
        @Body() data: CompanyUpdateDto,
    ): Promise<CompanyResponseDto> {
        return this.companyService.updateCompany(user.id, data);
    }
}
