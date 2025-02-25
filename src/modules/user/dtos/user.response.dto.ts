import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    })
    id: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'Username of the user',
        example: 'johndoe',
        required: false,
    })
    username: string | null;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        required: false,
    })
    firstName: string | null;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: false,
    })
    lastName: string | null;

    @ApiProperty({
        description: "URL of the user's profile picture",
        example: 'https://example.com/avatar.jpg',
        required: false,
    })
    avatar: string | null;

    @ApiProperty({
        description: "Indicates if the user's email is verified",
        example: false,
    })
    isVerified: boolean;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        required: false,
    })
    phone: string | null;

    @ApiProperty({
        description: 'Role of the user in the system',
        enum: ROLE,
        example: ROLE.User,
    })
    role: ROLE;

    @ApiProperty({
        description: 'The date and time when the user was created',
        example: '2024-02-23T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description:
            'The date and time when the user information was last updated',
        example: '2024-02-23T12:00:00Z',
    })
    updatedAt: Date;

    @ApiProperty({
        description:
            'The date and time when the user was deleted, if applicable',
        example: '2024-02-23T12:00:00Z',
        required: false,
    })
    deletedAt: Date | null;

    @ApiProperty({
        description: 'Indicates if the user is marked as deleted',
        example: false,
    })
    isDeleted: boolean;

    @Exclude()
    password: string | null;
}
