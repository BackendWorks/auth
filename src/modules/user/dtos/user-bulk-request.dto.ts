import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class UserBulkRequestDto {
    @ApiProperty({
        description: 'Ids of Users',
        example: [faker.string.uuid()],
        required: true,
        type: [String],
    })
    ids: string[];
}
