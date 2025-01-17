import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AuthUser } from 'src/common/decorators/auth.decorator';
import { AllowedRoles } from 'src/common/decorators/role.decorator';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import {
    CompanyResponseDto,
    CompanyWithUsersResponseDto,
} from 'src/modules/company/dtos/company.response.dto';
import { CompanyService } from 'src/modules/company/services/company.service';
import { CompanySearchDto } from 'src/modules/company//dtos/company.search.dto';

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

    @ApiBearerAuth('accessToken')
    @Get()
    @AllowedRoles([Role.USER, Role.ADMIN])
    getCompanyByUserId(@AuthUser() user: IAuthPayload): Promise<CompanyWithUsersResponseDto> {
        return this.companyService.getCompanyByUserId(user.id);
    }

    @ApiBearerAuth('accessToken')
    @Get()
    @AllowedRoles([Role.USER, Role.ADMIN])
    async getOrSearchCompanies(
        @AuthUser() user: IAuthPayload,
        @Query() query: CompanySearchDto,
    ): Promise<CompanyWithUsersResponseDto | CompanyWithUsersResponseDto[]> {
        const hasQueryParams = Object.values(query).some(value => !!value);

        if (!hasQueryParams) {
            return this.companyService.getCompanyByUserId(user.id);
        }

        return this.companyService.searchCompanies(query);
    }
}
