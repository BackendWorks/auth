import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: faker.internet.email(),
    required: false,
  })
  @IsEmail({}, { message: 'Enter valid email address' })
  @IsOptional()
  public email?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: faker.phone.number(),
    required: false,
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be valid' })
  @IsOptional()
  public phone?: string;

  @ApiProperty({
    description: 'First name of the user',
    example: faker.person.firstName(),
    required: false,
  })
  @IsString()
  @IsOptional()
  public firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: faker.person.lastName(),
    required: false,
  })
  @IsString()
  @IsOptional()
  public lastName?: string;

  @ApiProperty({
    description: "URL of the user's profile picture",
    example: faker.image.url(),
    required: false,
  })
  @IsString()
  @IsOptional()
  public avatar?: string;
}
