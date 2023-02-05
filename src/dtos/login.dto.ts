import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  public password: string;
}
