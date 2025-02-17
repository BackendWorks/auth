import { Controller, Get, Param } from '@nestjs/common';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';
import { ApiTags } from '@nestjs/swagger';
import { CompanyService } from 'src/modules/company/services/company.service';
import { Public } from 'src/common/decorators/public.decorator';
import { MessagePattern } from '@nestjs/microservices';
import { TransformMessagePayload } from 'common/decorators/payload.decorator';

@ApiTags('public.company')
@Controller({
    version: '1',
    path: '/company',
})
export class PublicCompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @MessagePattern('companyById')
    async getCompanyById(@TransformMessagePayload() { companyId }: { companyId: string }) {
        return this.companyService.getCompanyById(companyId);
    }

    @Public()
    @Get('/all')
    async getCompanies(): Promise<string[]> {
        return (await this.companyService.getAllCompaniesIds()).map(item => item.id);
    }

    @Public()
    @Get(':companyId')
    getCompany(@Param('companyId') companyId: string): Promise<CompanyResponseDto> {
        return this.companyService.getCompanyById(companyId);
    }
}
