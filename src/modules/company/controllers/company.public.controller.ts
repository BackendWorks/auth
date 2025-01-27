import { Controller, Get, Param } from '@nestjs/common';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';
import { ApiTags } from '@nestjs/swagger';
import { CompanyService } from 'src/modules/company/services/company.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('public.company')
@Controller({
    version: '1',
    path: '/company',
})
export class PublicCompanyController {
    constructor(private readonly companyService: CompanyService) {}

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
