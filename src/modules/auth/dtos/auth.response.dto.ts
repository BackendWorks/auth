import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';

export class AuthRefreshResponseDto {
    @ApiProperty({
        description: 'The access token for the authenticated user',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    accessToken: string;

    @ApiProperty({
        description: 'The refresh token for obtaining a new access token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.J2Hk_UHzVcgKeNqw2c8LjRnRX7JouiBGmmuVjHAi0IQ',
    })
    refreshToken: string;
}

export class AuthResponseDto extends AuthRefreshResponseDto {
    @ApiProperty({
        description: 'The user details',
        type: UserResponseDto,
    })
    @Type(() => UserResponseDto)
    @ValidateNested()
    user: UserResponseDto;
}
