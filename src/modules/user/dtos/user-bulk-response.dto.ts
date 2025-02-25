import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class UserBulkResponseDto {
    @ApiProperty({
        description: 'Count of users',
        example: 1,
    })
    count: number;
}
