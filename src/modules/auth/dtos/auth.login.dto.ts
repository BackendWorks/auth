import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
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
}
