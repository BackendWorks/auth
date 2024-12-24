import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

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
        description: 'Phone number of the user',
        example: '+1234567890',
    })
    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber(null)
    phone: string;
}
