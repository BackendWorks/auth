import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public lastName?: string;

  @ApiHideProperty()
  @IsOptional()
  public two_factor_secret?: string;
}
