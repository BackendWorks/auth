import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
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
}
