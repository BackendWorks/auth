import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompanySearchDto {
    @ApiPropertyOptional()
    organizationName?: string;

    @ApiPropertyOptional()
    inn?: string;

    @ApiPropertyOptional()
    ogrn?: string;

    @ApiPropertyOptional()
    companyId?: string;
}
