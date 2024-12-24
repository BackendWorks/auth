import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'john.doe@fishstat.ru',
        description: 'The email of the User',
        format: 'email',
        uniqueItems: true,
        minLength: 5,
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    @IsEmail()
    readonly email: string;
}

export class ForgotPasswordResponseDto {
    @ApiProperty({
        example: 'john.doe@fishstat.ru',
        description: 'The email of the User',
        format: 'email',
        uniqueItems: true,
        minLength: 5,
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    @IsEmail()
    readonly email: string;

    @ApiProperty({ example: 'verification sent' })
    readonly message: string;
}

export class ForgotPasswordVerifyResponseDto {
    @ApiProperty({
        example: 'john.doe@fishstat.ru',
        description: 'The email of the User',
        format: 'email',
        uniqueItems: true,
        minLength: 5,
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    @IsEmail()
    readonly email: string;

    @ApiProperty({ example: 'Now you can reset your password' })
    readonly message: string;
}

export class ForgotPasswordVerifyDto {
    @ApiProperty({
        description: 'uuid to verify user',
        format: 'uuid',
        uniqueItems: true,
    })
    @IsNotEmpty()
    @IsUUID()
    readonly verification: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        example: 'r.rostovchshikov@gmail.com',
        description: 'The email of the User',
        format: 'email',
        uniqueItems: true,
        minLength: 5,
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        example: 'secret password change me!',
        description: 'The password of the User',
        format: 'string',
        minLength: 5,
        maxLength: 1024,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(1024)
    readonly password: string;
}
