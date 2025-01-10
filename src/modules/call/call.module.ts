import { Module } from '@nestjs/common';
import { ZvonokService } from 'src/common/services/zvonok.service';
import { CallFactory } from './call.factory';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [ZvonokService, CallFactory],
    exports: [CallFactory],
})
export class CallModule {}
