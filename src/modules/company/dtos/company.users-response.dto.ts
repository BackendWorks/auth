import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CompanyUserResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: faker.string.uuid(),
    })
    id: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: faker.internet.email(),
    })
    email: string;

    @ApiProperty({
        description: 'First name of the user',
        example: faker.person.firstName(),
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: faker.person.lastName(),
    })
    lastName: string;

    @ApiProperty({
        description: 'Role of the user in the system',
        enum: $Enums.Role,
        example: $Enums.Role.USER,
    })
    role: $Enums.Role;

    @ApiProperty({
        description: 'The date and time when the user was created',
        example: faker.date.past().toISOString(),
    })
    createdAt: Date;

    @ApiProperty({
        description: "URL of the user's profile picture",
        example: faker.image.avatar(),
        required: false,
    })
    avatar: string;
}
