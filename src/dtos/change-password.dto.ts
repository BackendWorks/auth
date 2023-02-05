import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  public password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'token is required' })
  public token: string;
}
