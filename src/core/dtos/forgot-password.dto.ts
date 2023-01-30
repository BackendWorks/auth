import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'new password not provided' })
  public newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'token not provided' })
  public token: string;
}
