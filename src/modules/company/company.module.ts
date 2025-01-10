import { Module } from '@nestjs/common';

import { CommonModule } from 'auth/src/common/common.module';

import { CompanyService } from './services/company.service';
import { AuthCompanyController } from './controllers/company.auth.controller';
import { PublicCompanyController } from './controllers/company.public.controller';

@Module({
    controllers: [AuthCompanyController, PublicCompanyController],
    imports: [CommonModule],
    providers: [CompanyService],
    exports: [CompanyService],
})
export class CompanyModule {}
