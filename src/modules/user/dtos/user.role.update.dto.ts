import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserRoleUpdateDto {
    @ApiProperty({
        description: 'The new role to assign to the user',
        enum: Role,
        example: Role.ADMIN,
    })
    role: Role;
}
