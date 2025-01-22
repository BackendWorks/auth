import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsEmail,
    Matches,
    IsDateString,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    MinLength,
} from 'class-validator';

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
        example: faker.internet.password(),
        description: 'The password of the user',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @IsOptional()
    public password?: string;

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
        description: 'Patronymic of the user',
        example: faker.person.middleName(),
        required: false,
    })
    patronymic?: string;

    @ApiProperty({
        example: faker.image.avatar(),
        description: "User's profile picture URL",
        required: false,
    })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty({
        example: 'e2cfd6d0-9c7b-4382-b672-cc9b4dcaf534',
        description: 'Verification code for email confirmation',
        required: false,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    verification?: string;

    @ApiProperty({
        example: faker.date.future().toISOString(),
        description: 'The date and time until the user can verify their email',
        required: false,
        nullable: true,
    })
    @IsDateString()
    @IsOptional()
    verificationExpires?: Date;

    @ApiProperty({
        description: "Indicates if the user's email is verified",
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isEmailVerified?: boolean;

    @ApiProperty({
        description: "Indicates if the user's phone is verified",
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isPhoneVerified?: boolean;

    @ApiProperty({
        description: 'Number of login attempts the user has made',
        example: 0,
        required: false,
    })
    @IsInt()
    @IsOptional()
    loginAttempts?: number;

    @ApiProperty({
        example: faker.date.future().toISOString(),
        description: 'The date and time until which the user is blocked from certain actions',
        required: false,
        nullable: true,
    })
    @IsDateString()
    @IsOptional()
    blockExpires?: Date;

    @ApiProperty({
        description: 'Company ID',
        example: 12,
        required: false,
    })
    @IsInt()
    @IsOptional()
    companyId?: string;
}
