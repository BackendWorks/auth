import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';
import { UserLoginDto } from './auth.login.dto';

export class UserCreateDto extends UserLoginDto {
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
