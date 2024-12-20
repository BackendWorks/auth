import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({
        description: 'UUID to verify user',
        format: 'uuid',
        uniqueItems: true,
    })
    @IsNotEmpty()
    @IsUUID()
    readonly verification: string;
}
