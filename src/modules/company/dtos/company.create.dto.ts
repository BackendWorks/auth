// src/modules/company/dto/company.create.dto.ts

import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyCreateDto {
    @ApiProperty({
        description: 'Director first name',
        example: 'Павел',
    })
    @IsNotEmpty()
    @IsString()
    directorFirstName: string;

    @ApiProperty({
        description: 'Director last name',
        example: 'Рублев',
    })
    @IsNotEmpty()
    @IsString()
    directorLastName: string;

    @ApiPropertyOptional({
        description: 'Director patronymic (middle name)',
        example: 'Михайлович',
    })
    @IsOptional()
    @IsString()
    directorPatronymic?: string;

    @ApiProperty({
        description: 'Company name',
        example: 'ООО ФИШСТАТ',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'INN',
        example: '2537140750',
    })
    @IsString()
    inn: string;

    @ApiPropertyOptional({
        description: 'Primary State Registration Number',
        example: '1192536019059',
    })
    @IsString()
    ogrn: string;

    @ApiPropertyOptional({
        description: 'Country of registration',
        example: 'Россия',
    })
    @IsString()
    country: string;

    @ApiPropertyOptional({
        description: 'City of registration',
        example: 'Владивосток',
    })
    @IsString()
    city: string;

    @ApiPropertyOptional({
        description: 'Legal address',
        example: '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
    })
    @IsString()
    legalAddress: string;

    @ApiPropertyOptional({
        description: 'Company email',
        example: 'support@fishstat.ru',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        description: 'Company phone number',
        example: '79999999999',
    })
    @IsString()
    phone: string;

    @ApiPropertyOptional({
        description: 'Short description of the company',
        example: 'Площадка для торговли рыбой',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Link to the registration document (e.g. business license)',
    })
    @IsString()
    documentUrl: string;

    @ApiPropertyOptional({
        description: 'URL of the company logo',
        example: 'https://my-bucket.s3.amazonaws.com/company-logos/acme.jpg',
    })
    @IsOptional()
    @IsString()
    logoUrl?: string;
}
