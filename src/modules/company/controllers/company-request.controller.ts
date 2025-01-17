import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from 'src/common/decorators/role.decorator';
import { AuthUser } from 'src/common/decorators/auth.decorator';
import { CompanyRequestCreateDto } from 'src/modules/company/dtos/company.request.create.dto';
import { CompanyRequestService } from 'src/modules/company/services/company-request.service';
import { Role, CompanyRequestStatus } from '@prisma/client';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';

@ApiTags('company-requests')
@Controller({
    version: '1',
    path: '/company-requests',
})
export class CompanyRequestController {
    constructor(private readonly companyRequestService: CompanyRequestService) {}

    @ApiBearerAuth('accessToken')
    @Post()
    @AllowedRoles([Role.USER])
    createCompanyRequest(@AuthUser() user: IAuthPayload, @Body() dto: CompanyRequestCreateDto) {
        return this.companyRequestService.createRequest(user.id, dto);
    }

    @ApiBearerAuth('accessToken')
    @Get()
    @AllowedRoles([Role.ADMIN])
    getAllRequests(@Query('status') status?: CompanyRequestStatus) {
        return this.companyRequestService.getRequests(status);
    }
}
