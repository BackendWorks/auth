import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';

import { Company, CompanyVerificationStatus } from '@prisma/client';

@Injectable()
export class CompanyService {
    constructor(private readonly prisma: PrismaService) {}

    public async createCompany(
        userId: string,
        data: CompanyCreateDto,
    ): Promise<CompanyResponseDto> {
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

        await this.prisma.userCompany.create({
            data: {
                userId,
                companyId: createdCompany.id,
            },
        });

        return this.toCompanyResponseDto(createdCompany);
    }

    public async updateCompany(
        userId: string,
        data: CompanyUpdateDto,
    ): Promise<CompanyResponseDto> {
        const userCompany = await this.prisma.userCompany.findFirst({
            where: {
                userId,
                companyId: data.companyId,
            },
        });
        if (!userCompany) {
            throw new ForbiddenException('company.notOwned');
        }

        const updatedCompany = await this.prisma.company.update({
            where: { id: data.companyId },
            data: data,
        });

        return this.toCompanyResponseDto(updatedCompany);
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
