import { Injectable } from '@nestjs/common';
import { CallProviders, CallService } from './interfaces/call.interface';
import { ZvonokService } from 'src/common/services/zvonok.service';

@Injectable()
export class CallFactory {
    constructor(private readonly zvonokService: ZvonokService) {}

    /**
     * Возвращает экземпляр CallService на основе конфигурации
     */
    getCallService(provider: CallProviders): CallService {
        switch (provider) {
            case CallProviders.ZVONOK:
                return this.zvonokService;
            default:
                throw new Error(`Unsupported call provider: ${provider}`);
        }
    }
}
