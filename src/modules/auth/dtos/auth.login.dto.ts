import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthLoginDto {
    @ApiProperty({
        example: faker.internet.email(),
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @ApiProperty({
        example: faker.internet.password(),
        description: 'User password',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public password: string;
}
