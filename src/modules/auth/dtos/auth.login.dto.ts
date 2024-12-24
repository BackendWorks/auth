import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class AuthLoginByEmailDto {
    @ApiProperty({
        example: faker.internet.email(),
        description: 'The email address of the user',
    })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email: string;

    @ApiProperty({
        example: faker.internet.password(),
        description: 'The password of the user',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public password: string;
}

export class AuthLoginByPhoneDto {
    @ApiProperty({
        example: '+79999999999',
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
