import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AuthSignupDto {
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

    @ApiProperty({
        example: faker.person.firstName(),
        description: 'The first name of the user',
    })
    @IsString()
    @IsOptional()
    public firstName?: string;

    @ApiProperty({
        example: faker.person.lastName(),
        description: 'The last name of the user',
    })
    @IsString()
    @IsOptional()
    public lastName?: string;

    @ApiProperty({
        example: faker.internet.username(),
        description: 'The username of the user',
    })
    @IsString()
    @IsOptional()
    public username?: string;
}
