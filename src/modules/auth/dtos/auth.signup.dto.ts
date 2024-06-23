import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';

export class AuthSingupDto {
  @ApiProperty({
    example: faker.internet.email(),
    description: 'The email address of the user',
  })
  @IsEmail({}, { message: 'validation.email.isEmail' })
  @IsString({ message: 'validation.email.isString' })
  @IsNotEmpty({ message: 'validation.email.isNotEmpty' })
  public email: string;

  @ApiProperty({
    example: faker.internet.password(),
    description: 'The password of the user',
  })
  @IsString({ message: 'validation.password.isString' })
  @IsNotEmpty({ message: 'validation.password.isNotEmpty' })
  public password: string;

  @ApiProperty({
    example: faker.person.firstName(),
    description: 'The first name of the user',
  })
  @IsString({ message: 'validation.firstName.isString' })
  @IsOptional()
  public firstName?: string;

  @ApiProperty({
    example: faker.person.lastName(),
    description: 'The last name of the user',
  })
  @IsString({ message: 'validation.lastName.isString' })
  @IsOptional()
  public lastName?: string;

  @ApiProperty({
    example: faker.internet.userName(),
    description: 'The username of the user',
  })
  @IsString({ message: 'validation.username.isString' })
  @IsOptional()
  public username?: string;
}
