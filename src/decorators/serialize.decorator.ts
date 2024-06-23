import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiProperty,
} from '@nestjs/swagger';
import { ClassConstructor } from 'class-transformer';
import {
  RESPONSE_MESSAGE_META_KEY,
  RESPONSE_SERIALIZATION_META_KEY,
} from 'src/app/app.constant';

interface SerializeOptions {
  serialization?: ClassConstructor<unknown>;
  message?: string;
}

class ApiResponseBase<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty()
  data: T;
}

export function Serialize(options: SerializeOptions) {
  if (options.serialization) {
    const responseDecorators = [
      ApiResponse({
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponseBase) },
            {
              properties: {
                data: { $ref: getSchemaPath(options.serialization) },
              },
            },
          ],
        },
      }),
      ApiExtraModels(ApiResponseBase, options.serialization),
    ];

    return applyDecorators(
      ...responseDecorators,
      SetMetadata(RESPONSE_SERIALIZATION_META_KEY, options.serialization),
    );
  }

  if (options.message) {
    const responseDecorators = [
      ApiResponse({
        schema: {
          allOf: [{ $ref: getSchemaPath(ApiResponseBase) }],
        },
      }),
    ];

    return applyDecorators(
      ...responseDecorators,
      SetMetadata(RESPONSE_MESSAGE_META_KEY, options.message),
    );
  }
}
