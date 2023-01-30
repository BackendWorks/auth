import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'email not provided' })
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password not provided' })
  public password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'firstname not provided' })
  public firstname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'lastname not provided' })
  public lastname: string;
}
