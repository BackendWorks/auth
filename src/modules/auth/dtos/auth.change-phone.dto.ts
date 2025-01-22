import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePhoneDto {
    @ApiProperty({
        example: '79999999999',
        description: 'The phone number of the user',
        uniqueItems: true,
        minLength: 11,
        maxLength: 11,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(11)
    @MaxLength(11)
    readonly phone: string;
}
