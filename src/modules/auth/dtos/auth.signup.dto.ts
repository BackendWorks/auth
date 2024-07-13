import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { faker } from '@faker-js/faker';

export class AuthSignupDto {
  @ApiProperty({
    example: faker.internet.email(),
    description: 'The email address of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  public email: string;

  @ApiProperty({
    example: faker.internet.password(),
    description: 'The password of the user',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  public password: string;

  @ApiProperty({
    example: faker.person.firstName(),
    description: 'The first name of the user',
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  public firstName?: string;

  @ApiProperty({
    example: faker.person.lastName(),
    description: 'The last name of the user',
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  public lastName?: string;

  @ApiProperty({
    example: faker.internet.userName(),
    description: 'The username of the user',
  })
  @IsString({ message: 'Username must be a string' })
  @IsOptional()
  public username?: string;
}
