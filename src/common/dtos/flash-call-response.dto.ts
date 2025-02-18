import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/modules/user/dtos/user.response.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class SendFlashCallResponseDto {
    @ApiProperty({ example: 200 })
    status: number;

    @ApiProperty({ example: 'Flash call initiated successfully' })
    description: string;
}

export class VerifyFlashCallResponseDto {
    @ApiProperty({
        description: 'The user details',
        type: UserResponseDto,
    })
    @Type(() => UserResponseDto)
    @ValidateNested()
    updatedUser: UserResponseDto;
}
