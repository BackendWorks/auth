import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';

import { AdminUserController } from './controllers/user.admin.controller';
import { AuthUserController } from './controllers/user.auth.controller';
import { UserService } from './services/user.service';
import { CompanyRequestService } from 'src/modules/company/services/company-request.service';

@Module({
    controllers: [AuthUserController, AdminUserController],
    imports: [CommonModule],
    providers: [UserService, CompanyRequestService],
    exports: [UserService],
})
export class UserModule {}
