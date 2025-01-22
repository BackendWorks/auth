import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AuthUser } from 'src/common/decorators/auth.decorator';
import { AllowedRoles } from 'src/common/decorators/role.decorator';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';
import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';
import { CompanyService } from 'src/modules/company/services/company.service';
import { CompanySearchDto } from 'src/modules/company/dtos/company.search.dto';
import { CompanyDocumentCreateDto } from 'src/modules/company/dtos/company.documents.create';
import { CompanyDocumentResponseDto } from 'src/modules/company/dtos/company.document.response.dto';

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
    getCompanyByUserId(@AuthUser() user: IAuthPayload): Promise<CompanyResponseDto> {
        return this.companyService.getCompanyByUserId(user.id);
    }

    @ApiBearerAuth('accessToken')
    @Get()
    @AllowedRoles([Role.USER, Role.ADMIN])
    async getOrSearchCompanies(
        @AuthUser() user: IAuthPayload,
        @Query() query: CompanySearchDto,
    ): Promise<CompanyResponseDto[] | CompanyResponseDto> {
        const hasQueryParams = Object.values(query).some(value => !!value);

        if (!hasQueryParams) {
            return this.companyService.getCompanyByUserId(user.id);
        }

        return this.companyService.searchCompanies(query);
    }

    @ApiBearerAuth('accessToken')
    @Post(':companyId/document')
    @AllowedRoles([Role.USER, Role.ADMIN])
    async addDocumentToCompany(
        @AuthUser() user: IAuthPayload,
        @Param('companyId') companyId: string,
        @Body() data: CompanyDocumentCreateDto,
    ): Promise<CompanyDocumentResponseDto> {
        return this.companyService.addDocumentToCompany(user.id, companyId, data);
    }

    @ApiBearerAuth('accessToken')
    @Get(':companyId/document')
    @AllowedRoles([Role.USER, Role.ADMIN])
    async getDocumentsByCompany(
        @AuthUser() user: IAuthPayload,
        @Param('companyId') companyId: string,
    ): Promise<CompanyDocumentResponseDto[]> {
        return this.companyService.getDocumentsByCompanyId(user.id, companyId);
    }
}
