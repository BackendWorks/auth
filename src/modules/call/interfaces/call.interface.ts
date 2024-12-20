import { SendFlashCallDto } from 'src/common/dtos/send-flash-call.dto';

export interface CallService {
    initiateFlashCall(sendFlashCallDto: SendFlashCallDto): Promise<string>;
}

export enum CallProviders {
    ZVONOK = 'zvonok',
}
