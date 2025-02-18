import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CallService } from 'src/modules/call/interfaces/call.interface';
import { firstValueFrom } from 'rxjs';
import { SendFlashCallDto } from 'src/common/dtos/send-flash-call.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ZvonokService implements CallService {
    private readonly logger = new Logger(ZvonokService.name);
    private readonly publicKey: string;
    private readonly campaignId: string;
    private readonly flashCallUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.publicKey = this.configService.get<string>('zvonok.publicKey');
        this.campaignId = this.configService.get<string>('zvonok.campaignId');
        this.flashCallUrl = this.configService.get<string>('zvonok.flashCallUrl');
    }

    async initiateFlashCall(sendFlashCallDto: SendFlashCallDto): Promise<string> {
        const { phone } = sendFlashCallDto;
        const endpoint = `${this.flashCallUrl}`;

        const params = {
            public_key: this.publicKey,
            phone,
            campaign_id: this.campaignId,
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post(endpoint, null, { params }),
            );

            const pincode: string = response.data.data.pincode;

            if (!pincode) {
                throw new HttpException(
                    'Invalid pincode received from Zvonok API',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return pincode;
        } catch (error) {
            this.logger.error(`Error from Zvonok API: ${error.message}`);
            throw new HttpException(
                'Failed to initiate flash call with Zvonok',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
