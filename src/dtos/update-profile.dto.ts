import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public deviceToken: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public profile: string;
}
