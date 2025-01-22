import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyDocumentCreateDto {
    @ApiProperty({
        description: 'File ID',
        example: 'cf024c64-3b2c-4c57-bc83-233d36ad1d66',
    })
    @IsNotEmpty()
    @IsString()
    fileId: string;

    @ApiProperty({
        description: 'Link to the registration document (e.g. business license)',
    })
    @IsNotEmpty()
    @IsString()
    documentUrl: string;
}
