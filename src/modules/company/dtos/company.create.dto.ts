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

    @ApiProperty({
        description: 'Director patronymic (middle name)',
        example: 'Михайлович',
    })
    @IsNotEmpty()
    @IsString()
    directorPatronymic: string;

    @ApiProperty({
        description: 'Company name',
        example: 'ООО ФИШСТАТ',
    })
    @IsNotEmpty()
    @IsString()
    organizationName: string;

    @ApiProperty({
        description: 'INN',
        example: '2537140750',
    })
    @IsString()
    inn: string;

    @ApiProperty({
        description: 'Primary State Registration Number',
        example: '1192536019059',
    })
    @IsString()
    ogrn: string;

    @ApiPropertyOptional({
        description: 'Country of registration',
        example: 'Россия',
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({
        description: 'City of registration',
        example: 'Владивосток',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        description: 'Legal address',
        example: '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
    })
    @IsString()
    @IsNotEmpty()
    legalAddress: string;

    @ApiProperty({
        description: 'Company email',
        example: 'support@fishstat.ru',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Company phone number',
        example: '79999999999',
    })
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty({
        description: 'Short description of the company',
        example: 'Площадка для торговли рыбой',
    })
    @IsNotEmpty()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Link to the registration document (e.g. business license)',
    })
    @IsNotEmpty()
    @IsString()
    documentUrl: string;

    @ApiProperty({
        description: 'URL of the company logo',
        example: 'https://my-bucket.s3.amazonaws.com/company-logos/acme.jpg',
    })
    @IsOptional()
    @IsString()
    logoUrl?: string;
}
