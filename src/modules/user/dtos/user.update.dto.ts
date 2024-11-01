import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';

export class UserUpdateDto {
    @ApiProperty({
        example: faker.internet.email(),
        description: 'Email address of the user',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: faker.phone.number(),
        description: 'Phone number of the user',
        required: false,
    })
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({
        example: faker.person.firstName(),
        description: 'First name of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({
        example: faker.person.lastName(),
        description: 'Last name of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({
        example: faker.image.avatar(),
        description: "User's profile picture URL",
        required: false,
    })
    @IsString()
    @IsOptional()
    avatar?: string;
}
