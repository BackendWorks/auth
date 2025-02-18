import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsNotEmpty, Length } from 'class-validator';

export class VerifyPhoneDto {
    @ApiProperty({
        example: '79999999999',
        description: 'Phone number in 7XXXXXXXXXX format',
    })
    @IsNotEmpty()
    @IsPhoneNumber('RU', { message: 'Invalid phone number format.' })
    readonly phone: string;

    @ApiProperty({
        example: '1234',
        description: '4-digits verification code',
        minLength: 4,
        maxLength: 4,
    })
    @IsNotEmpty()
    @Length(4, 4, { message: 'Verification code must be 4 digits.' })
    readonly code: string;
}
