import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public lastName: string;

  @ApiProperty()
  @IsEnum(Role)
  @IsOptional()
  public role: Role;
}
