import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  public password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'firstName is required' })
  public firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'lastName is required' })
  public lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public deviceToken: string;
}
