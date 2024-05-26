import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { RESPONSE_SERIALIZATION_META_KEY } from 'src/app/app.constant';

export function Serialize(dto: ClassConstructor<any>) {
  return applyDecorators(SetMetadata(RESPONSE_SERIALIZATION_META_KEY, dto));
}
