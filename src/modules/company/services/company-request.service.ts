import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CompanyRequestStatus } from '@prisma/client';
import { CompanyRequestCreateDto } from 'src/modules/company/dtos/company.request.create.dto';
import { CompanyRequestUpdateDto } from 'src/modules/company/dtos/company.request.update.dto';

@Injectable()
export class CompanyRequestService {
    constructor(private readonly prisma: PrismaService) {}

    async createRequest(userId: string, dto: CompanyRequestCreateDto) {
        return this.prisma.companyRequest.create({
            data: {
                userId,
                companyId: dto.companyId,
                status: CompanyRequestStatus.PENDING,
            },
        });
    }

    async updateRequestStatus(requestId: string, dto: CompanyRequestUpdateDto) {
        const request = await this.prisma.companyRequest.findUnique({
            where: { id: requestId },
            include: {
                user: true,
            },
        });

        if (!request) {
            throw new NotFoundException(`Request with ID "${requestId}" not found`);
        }

        const updated = await this.prisma.companyRequest.update({
            where: { id: requestId },
            data: { status: dto.status },
        });

        if (dto.status === CompanyRequestStatus.APPROVED) {
            await this.prisma.user.update({
                where: { id: request.userId },
                data: { companyId: request.companyId },
            });
        }

        return updated;
    }

    async getRequests(status?: CompanyRequestStatus) {
        return this.prisma.companyRequest.findMany({
            where: status ? { status } : undefined,
            include: {
                user: true,
                company: true,
            },
        });
    }
}
