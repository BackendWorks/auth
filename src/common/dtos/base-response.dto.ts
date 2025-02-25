import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export abstract class ApiBaseResponseDto {
    @ApiProperty({
        description: 'HTTP Status code',
        example: 200,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Timestamp of the response',
        example: new Date().toISOString(),
    })
    timestamp: string;

    @ApiProperty({
        description: 'Response message',
        example: 'Success',
    })
    message: string;
}

export abstract class ApiResponseDto<T> extends ApiBaseResponseDto {
    abstract data: T;
}

export function SwaggerResponse<TModel>(model: new () => TModel) {
    class SwaggerResponseType extends ApiResponseDto<TModel> {
        @ApiProperty({
            type: model,
            description: 'Response data',
        })
        @Type(() => model)
        data: TModel;
    }

    Object.defineProperty(SwaggerResponseType, 'name', {
        value: `${model.name}Response`,
    });

    return SwaggerResponseType;
}

export function SwaggerArrayResponse<TModel>(model: new () => TModel) {
    class SwaggerResponseType extends ApiResponseDto<TModel[]> {
        @ApiProperty({
            type: () => model,
            isArray: true,
            description: 'Response data',
        })
        @Type(() => model)
        data: TModel[];
    }

    Object.defineProperty(SwaggerResponseType, 'name', {
        value: `${model.name}ArrayResponse`,
    });

    return SwaggerResponseType;
}
