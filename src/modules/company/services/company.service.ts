import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import { CompanyResponseDto } from 'src/modules/company/dtos/company.response.dto';

import { Company, CompanyVerificationStatus } from '@prisma/client';
import { CompanySearchDto } from 'src/modules/company/dtos/company.search.dto';
import { CompanyDocumentCreateDto } from 'src/modules/company/dtos/company.documents.create';
import { CompanyDocumentResponseDto } from 'src/modules/company/dtos/company.document.response.dto';

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

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                companyId: createdCompany.id,
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

        if (!user?.companyId && user.companyId !== data.id) {
            throw new ForbiddenException('company.notOwned');
        }

        const updatedCompany = await this.prisma.company.update({
            where: { id: data.id },
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

        return {
            ...this.toCompanyResponseDto(company),
        };
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

    async searchCompanies(searchDto: CompanySearchDto): Promise<CompanyResponseDto[]> {
        const { organizationName, inn, ogrn } = searchDto;

        return this.prisma.company.findMany({
            where: {
                organizationName: organizationName
                    ? { contains: organizationName, mode: 'insensitive' }
                    : undefined,
                inn: inn ? { contains: inn, mode: 'insensitive' } : undefined,
                ogrn: ogrn ? { contains: ogrn, mode: 'insensitive' } : undefined,
            },
            include: {
                users: true,
            },
        });
    }

    public async addDocumentToCompany(
        userId: string,
        companyId: string,
        data: CompanyDocumentCreateDto,
    ): Promise<CompanyDocumentResponseDto> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.companyId !== companyId) {
            throw new ForbiddenException('You do not own this company');
        }

        return this.prisma.companyDocument.create({
            data: {
                companyId,
                ...data,
            },
        });
    }

    public async getDocumentsByCompanyId(
        userId: string,
        companyId: string,
    ): Promise<CompanyDocumentResponseDto[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });
        if (!user || user.companyId !== companyId) {
            throw new ForbiddenException('You do not own this company');
        }

        const documents = await this.prisma.companyDocument.findMany({
            where: { companyId },
        });

        if (!documents.length) {
            throw new NotFoundException('No documents found for this company');
        }

        return documents;
    }
}
