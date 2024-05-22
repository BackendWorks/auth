import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';

export class UserCreateDto {
  @ApiProperty({
    example: faker.internet.email(),
  })
  @IsString()
  @IsNotEmpty({ message: 'email not provided' })
  public email: string;

  @ApiProperty({
    example: faker.internet.password(),
  })
  @IsString()
  @IsNotEmpty({ message: 'password not provided' })
  public password: string;

  @ApiProperty({
    example: faker.person.firstName(),
  })
  @IsString()
  @IsOptional()
  public firstName?: string;

  @ApiProperty({
    example: faker.person.lastName(),
  })
  @IsString()
  @IsOptional()
  public lastName?: string;

  @ApiProperty({
    example: faker.internet.userName(),
  })
  @IsString()
  @IsOptional()
  public username?: string;
}
