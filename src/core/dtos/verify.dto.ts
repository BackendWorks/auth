import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'otp is required' })
  @IsString()
  public otp: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'email is required' })
  @IsString()
  public email: string;
}

export class GetOtpDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'email is required' })
  @IsString()
  public email: string;
}
