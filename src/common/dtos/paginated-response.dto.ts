import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { ApiBaseResponseDto } from './base-response.dto';

export class PaginatedData<T> {
    @ApiProperty({
        description: 'Current page number',
        example: 1,
        minimum: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of items',
        example: 100,
        minimum: 0,
    })
    total: number;

    @ApiProperty({
        description: 'Array of items',
        isArray: true,
    })
    data: T[];
}

export abstract class ApiPaginatedResponseDto<T> extends ApiBaseResponseDto {
    @ApiProperty({
        description: 'Paginated response data',
        type: PaginatedData,
        additionalProperties: false,
    })
    abstract data: PaginatedData<T>;
}

export function SwaggerPaginatedResponse<TModel>(model: new () => TModel) {
    class PaginatedDataType extends PaginatedData<TModel> {
        @ApiProperty({
            type: model,
            isArray: true,
        })
        @Type(() => model)
        data: TModel[];
    }

    class SwaggerPaginatedResponseType extends ApiPaginatedResponseDto<TModel> {
        @ApiProperty({
            description: 'Paginated response data',
            type: PaginatedDataType,
        })
        @Type(() => PaginatedDataType)
        data: PaginatedData<TModel>;
    }

    Object.defineProperty(SwaggerPaginatedResponseType, 'name', {
        value: `Paginated${model.name}Response`,
    });

    return SwaggerPaginatedResponseType;
}
