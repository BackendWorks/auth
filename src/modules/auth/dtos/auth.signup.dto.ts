import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';

export class AuthSingupDto {
  @ApiProperty({
    example: faker.internet.email(),
    description: 'The email address of the user',
  })
  @IsString({ message: 'email must be a string' })
  @IsNotEmpty({ message: 'email not provided' })
  public email: string;

  @ApiProperty({
    example: faker.internet.password(),
    description: 'The password of the user',
  })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password not provided' })
  public password: string;

  @ApiProperty({
    example: faker.person.firstName(),
    description: 'The first name of the user',
  })
  @IsString({ message: 'firstName must be a string' })
  @IsOptional()
  public firstName?: string;

  @ApiProperty({
    example: faker.person.lastName(),
    description: 'The last name of the user',
  })
  @IsString({ message: 'lastName must be a string' })
  @IsOptional()
  public lastName?: string;

  @ApiProperty({
    example: faker.internet.userName(),
    description: 'The username of the user',
  })
  @IsString({ message: 'username must be a string' })
  @IsOptional()
  public username?: string;
}
