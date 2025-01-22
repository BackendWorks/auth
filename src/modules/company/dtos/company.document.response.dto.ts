import { ApiProperty } from '@nestjs/swagger';

export class CompanyDocumentResponseDto {
    @ApiProperty({ example: 'd41d8cd9-8f00-b204-e980-0998ecf8427e' })
    id: string;

    @ApiProperty({ example: 'file-uuid-123' })
    fileId: string;

    @ApiProperty({ example: 'https://example.com/my-file.pdf' })
    documentUrl: string;

    @ApiProperty({ example: '2023-12-25T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2023-12-25T10:00:00.000Z' })
    updatedAt: Date;
}
