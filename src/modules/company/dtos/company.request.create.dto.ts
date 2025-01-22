import { ApiProperty } from '@nestjs/swagger';

export class CompanyRequestCreateDto {
    @ApiProperty({ description: 'The ID of the company to join' })
    companyId: string;

    @ApiProperty({
        description: 'Optional message from user requesting to join',
        required: false,
    })
    message?: string;
}
