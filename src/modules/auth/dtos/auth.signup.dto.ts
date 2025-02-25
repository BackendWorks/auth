import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class AuthSignupDto {
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

    @ApiProperty({
        example: faker.person.firstName(),
        description: 'First name of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    public firstName?: string;

    @ApiProperty({
        example: faker.person.lastName(),
        description: 'Last name of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    public lastName?: string;

    @ApiProperty({
        example: faker.internet.username(),
        description: 'Username of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    public username?: string;
}
