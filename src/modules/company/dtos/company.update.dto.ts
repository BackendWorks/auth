import { IsOptional, IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyUpdateDto {
    @ApiProperty({
        description: 'The ID of the company to update',
        example: 'cf024c64-3b2c-4c57-bc83-233d36ad1d66',
    })
    @IsNotEmpty()
    @IsString()
    companyId: string;

    @ApiPropertyOptional({
        description: 'Director first name',
        example: 'Павел',
    })
    @IsOptional()
    @IsString()
    directorFirstName?: string;

    @ApiPropertyOptional({
        description: 'Director last name',
        example: 'Рублев',
    })
    @IsOptional()
    @IsString()
    directorLastName?: string;

    @ApiPropertyOptional({
        description: 'Director patronymic (middle name)',
        example: 'Михайлович',
    })
    @IsOptional()
    @IsString()
    directorPatronymic?: string;

    @ApiPropertyOptional({
        description: 'Company name',
        example: 'ООО ФИШСТАТ',
    })
    @IsOptional()
    @IsString()
    organizationName?: string;

    @ApiPropertyOptional({
        description: 'Legal address',
        example: '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
    })
    @IsOptional()
    @IsString()
    legalAddress?: string;

    @ApiPropertyOptional({
        description: 'Company email',
        example: 'support@fishstat.ru',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Company phone number',
        example: '79999999999',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Short description of the company',
        example: 'Площадка для торговли рыбой',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'URL of the company logo (to update)',
        example: 'https://my-bucket.s3.amazonaws.com/company-logos/acme-updated.jpg',
    })
    @IsOptional()
    @IsString()
    logoUrl?: string;
}
