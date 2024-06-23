import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto implements User {
  @ApiProperty({
    description: 'The date and time when the user was created',
    example: new Date().toISOString(),
  })
  created_at: Date;

  @ApiProperty({
    description: 'The date and time when the user was deleted, if applicable',
    example: new Date().toISOString(),
    required: false,
  })
  deleted_at: Date;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 1,
  })
  id: string;

  @ApiProperty({
    description: 'Indicates if the user is marked as deleted',
    example: false,
  })
  is_deleted: boolean;

  @ApiProperty({
    description: "Indicates if the user's email is verified",
    example: true,
  })
  is_verified: boolean;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: "URL of the user's profile picture",
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  avatar: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: $Enums.Roles,
  })
  role: $Enums.Roles;

  @ApiProperty({
    description: 'The date and time when the user information was last updated',
    example: new Date().toISOString(),
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Username of the user',
    example: 'johndoe',
  })
  username: string;

  @Exclude()
  password: string;
}
