import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyUserResponseDto } from './company.users-response.dto';

export class CompanyResponseDto {
    @ApiProperty({
        description: 'Company ID',
        example: 'cf024c64-3b2c-4c57-bc83-233d36ad1d66',
    })
    id: string;

    @ApiProperty({
        description: 'Director first name',
        example: 'Павел',
    })
    directorFirstName: string;

    @ApiProperty({
        description: 'Director last name',
        example: 'Рублев',
    })
    directorLastName: string;

    @ApiProperty({
        description: 'Director patronymic (middle name), if present',
        example: 'Михайлович',
        required: false,
    })
    directorPatronymic?: string;

    @ApiProperty({
        description: 'Taxpayer Identification Number, if present',
        example: '2537140750',
        required: false,
    })
    inn: string;

    @ApiProperty({
        description: 'Primary State Registration Number, if present',
        example: '1192536019059',
        required: false,
    })
    ogrn: string;

    @ApiProperty({
        description: 'Company name',
        example: 'ООО ФИШСТАТ',
    })
    organizationName: string;

    @ApiProperty({
        description: 'Country of registration, if present',
        example: 'Россия',
        required: false,
    })
    country: string;

    @ApiProperty({
        description: 'City of registration, if present',
        example: 'Владивосток',
        required: false,
    })
    city: string;

    @ApiProperty({
        description: 'Legal address, if present',
        example: '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
        required: false,
    })
    legalAddress?: string;

    @ApiProperty({
        description: 'Company email, if present',
        example: 'support@fishstat.ru',
        required: false,
    })
    email?: string;

    @ApiProperty({
        description: 'Company phone number, if present',
        example: '79999999999',
        required: false,
    })
    phone?: string;

    @ApiProperty({
        description: 'Short description of the company, if present',
        example: 'Площадка для торговли рыбой',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Link to the registration document, if present',
        required: false,
    })
    documentUrl?: string;

    @ApiPropertyOptional({
        description: 'URL of the company logo',
        example: 'https://my-bucket.s3.amazonaws.com/company-logos/acme.jpg',
    })
    logoUrl?: string;

    @ApiProperty({
        description: 'Verification status (UNVERIFIED / VERIFIED)',
        example: 'UNVERIFIED',
    })
    status: string;

    @ApiProperty({
        description: 'Record creation date',
        example: '2024-01-01T12:34:56Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date of the last update',
        example: '2024-01-02T10:11:12Z',
    })
    updatedAt: Date;
}

export class CompanyWithUsersResponseDto extends CompanyResponseDto {
    users: CompanyUserResponseDto[];
}
