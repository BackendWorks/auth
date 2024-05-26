import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: faker.internet.email(),
  })
  @IsString()
  @IsOptional()
  public email?: string;

  @ApiProperty({
    example: faker.phone.number(),
  })
  @IsString()
  @IsOptional()
  public phone?: string;

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
    example: faker.image.url(),
  })
  @IsString()
  @IsOptional()
  public profilePicture?: string;
}
