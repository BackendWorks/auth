import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';

import { Company, CompanyVerificationStatus } from '@prisma/client';

@Injectable()
export class CompanyService {
    constructor(private readonly prisma: PrismaService) {}

    public async createCompany(data: CompanyCreateDto): Promise<CompanyResponseDto> {
        const createdCompany = await this.prisma.company.create({
            data: {
                directorFirstName: data.directorFirstName,
                directorLastName: data.directorLastName,
                directorPatronymic: data.directorPatronymic,
                inn: data.inn,
                ogrn: data.ogrn,
                organizationName: data.organizationName,
                country: data.country,
                city: data.city,
                legalAddress: data.legalAddress,
                email: data.email,
                phone: data.phone,
                description: data.description,
                documentUrl: data.documentUrl,
                logoUrl: data.logoUrl ?? null,
                status: CompanyVerificationStatus.UNVERIFIED,
            },
        });

        return this.toCompanyResponseDto(createdCompany);
    }

    public async updateCompany(
        userId: string,
        data: CompanyUpdateDto,
    ): Promise<CompanyResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });

        if (!user?.companyId && user.companyId !== data.companyId) {
            throw new ForbiddenException('company.notOwned');
        }

        const updatedCompany = await this.prisma.company.update({
            where: { id: data.companyId },
            data,
        });

        return this.toCompanyResponseDto(updatedCompany);
    }

    public async getCompanyByUserId(userId: string): Promise<CompanyResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });

        if (!user) {
            throw new NotFoundException('user.userNotFound');
        }

        const company = await this.prisma.company.findUnique({
            where: { id: user.companyId },
        });

        if (!company) {
            throw new NotFoundException(`No company found for user ${userId}`);
        }

        return this.toCompanyResponseDto(company);
    }

    public async getCompanyById(companyId: string): Promise<CompanyResponseDto> {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });

        return this.toCompanyResponseDto(company);
    }

    private toCompanyResponseDto(company: Company): CompanyResponseDto {
        if (!company) {
            throw new NotFoundException('company.notExist');
        }

        return {
            id: company.id,
            directorFirstName: company.directorFirstName,
            directorLastName: company.directorLastName,
            directorPatronymic: company.directorPatronymic,
            inn: company.inn,
            ogrn: company.ogrn,
            organizationName: company.organizationName,
            country: company.country,
            city: company.city,
            legalAddress: company.legalAddress,
            email: company.email,
            phone: company.phone,
            description: company.description,
            documentUrl: company.documentUrl,
            status: company.status,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }
}
