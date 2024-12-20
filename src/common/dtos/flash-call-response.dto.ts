import { ApiProperty } from '@nestjs/swagger';

export class SendFlashCallResponseDto {
    @ApiProperty({ example: 200 })
    status: number;

    @ApiProperty({ example: 'Flash call initiated successfully' })
    description: string;
}

export class VerifyFlashCallResponseDto {
    @ApiProperty({ example: 200 })
    status: number;

    @ApiProperty({ example: 'Phone verified successfully' })
    description: string;
}
