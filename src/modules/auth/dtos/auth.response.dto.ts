import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';

export class AuthRefreshResponseDto {
    @ApiProperty({
        description: 'The access token for the authenticated user',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;
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
