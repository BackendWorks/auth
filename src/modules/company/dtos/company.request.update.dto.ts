import { ApiProperty } from '@nestjs/swagger';
import { CompanyRequestStatus } from '@prisma/client';

export class CompanyRequestUpdateDto {
    @ApiProperty({
        description: 'The new status for the request',
        enum: CompanyRequestStatus,
    })
    status: CompanyRequestStatus;
}
