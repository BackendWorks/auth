import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  public profilePicture?: string;
}
