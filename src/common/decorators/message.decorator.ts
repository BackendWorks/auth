import { SetMetadata } from '@nestjs/common';

import { MESSAGE_KEY_METADATA } from '../constants/response.constant';

export const MessageKey = (key: string) =>
    SetMetadata(MESSAGE_KEY_METADATA, key);
