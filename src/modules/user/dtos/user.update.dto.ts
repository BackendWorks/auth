import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UserUpdateDto {
    @ApiProperty({
        description: 'Email address of the user',
        example: faker.internet.email(),
        required: false,
    })
    @IsEmail({}, { message: 'Enter valid email address' })
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'Username of the user',
        example: faker.internet.username(),
        required: false,
    })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: faker.phone.number(),
        required: false,
    })
    @IsString()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be E.164 format',
    })
    @IsOptional()
    phone?: string;

    @ApiProperty({
        description: 'First name of the user',
        example: faker.person.firstName(),
        required: false,
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: faker.person.lastName(),
        required: false,
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({
        description: "URL of the user's profile picture",
        example: faker.image.avatar(),
        required: false,
    })
    @IsString()
    @IsOptional()
    avatar?: string;
}
