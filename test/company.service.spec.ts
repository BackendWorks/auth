import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Company, CompanyVerificationStatus } from '@prisma/client';
import { CompanyCreateDto } from 'src/modules/company/dtos/company.create.dto';
import { CompanyUpdateDto } from 'src/modules/company/dtos/company.update.dto';
import { CompanyService } from '../src/modules/company/services/company.service';

const mockCompany: Company = {
    id: '550e8412-e29b-41d4-a716-446655440000',
    directorFirstName: 'Павел',
    directorLastName: 'Рублев',
    directorPatronymic: null,
    inn: '2537140750',
    ogrn: null,
    organizationName: 'ООО ФИШСТАТ',
    country: 'Россия',
    city: 'Владивосток',
    legalAddress: '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
    email: 'support@fishstat.ru',
    phone: '79999999999',
    description: 'Площадка для торговли рыбой',
    documentUrl: 'https://example.com/doc',
    logoUrl: null,
    status: CompanyVerificationStatus.UNVERIFIED,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T10:00:00.000Z'),
};

describe('CompanyService', () => {
    let companyService: CompanyService;
    let prismaService: PrismaService;

    const prismaMock = {
        company: {
            create: jest.fn(),
            update: jest.fn(),
        },
        userCompany: {
            create: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        companyService = module.get<CompanyService>(CompanyService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCompany', () => {
        it('should create a new company and link it to the user', async () => {
            const userId = '550e8400-e29b-41d4-a716-446655440000';
            const dto: CompanyCreateDto = {
                directorFirstName: 'Павел',
                directorLastName: 'Рублев',
                directorPatronymic: 'Михайлович',
                inn: '2537140750',
                ogrn: '1192536019059',
                organizationName: 'ООО ФИШСТАТ',
                country: 'Россия',
                city: 'Владивосток',
                legalAddress:
                    '690021, Приморский край, город Владивосток, Черемуховая ул, д. 7, офис 410',
                email: 'support@fishstat.ru',
                phone: '79999999999',
                description: 'Площадка для торговли рыбой',
                documentUrl: 'https://docs.com/somefile.pdf',
                logoUrl: 'https://images.com/logo.png',
            };

            const mockCreatedCompany = {
                ...mockCompany,
                id: '550e8412-e29b-41d4-a716-446655440000',
                directorFirstName: dto.directorFirstName,
                directorLastName: dto.directorLastName,
                directorPatronymic: dto.directorPatronymic,
                inn: dto.inn,
                ogrn: dto.ogrn,
                organizationName: dto.organizationName,
                country: dto.country,
                city: dto.city,
                legalAddress: dto.legalAddress,
                email: dto.email,
                phone: dto.phone,
                description: dto.description,
                documentUrl: dto.documentUrl,
                logoUrl: dto.logoUrl,
            };

            prismaMock.company.create.mockResolvedValue(mockCreatedCompany);
            prismaMock.userCompany.create.mockResolvedValue({
                id: '1',
                userId: userId,
                companyId: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await companyService.createCompany(userId, dto);

            expect(prismaService.company.create).toHaveBeenCalledWith({
                data: {
                    directorFirstName: dto.directorFirstName,
                    directorLastName: dto.directorLastName,
                    directorPatronymic: dto.directorPatronymic,
                    inn: dto.inn,
                    ogrn: dto.ogrn,
                    organizationName: dto.organizationName,
                    country: dto.country,
                    city: dto.city,
                    legalAddress: dto.legalAddress,
                    email: dto.email,
                    phone: dto.phone,
                    description: dto.description,
                    documentUrl: dto.documentUrl,
                    logoUrl: dto.logoUrl,
                    status: CompanyVerificationStatus.UNVERIFIED,
                },
            });

            expect(prismaService.userCompany.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    companyId: mockCreatedCompany.id,
                },
            });

            expect(result).toEqual({
                id: '550e8412-e29b-41d4-a716-446655440000',
                directorFirstName: dto.directorFirstName,
                directorLastName: dto.directorLastName,
                directorPatronymic: dto.directorPatronymic,
                inn: dto.inn,
                ogrn: dto.ogrn,
                organizationName: dto.organizationName,
                country: dto.country,
                city: dto.city,
                legalAddress: dto.legalAddress,
                email: dto.email,
                phone: dto.phone,
                description: dto.description,
                documentUrl: dto.documentUrl,
                status: CompanyVerificationStatus.UNVERIFIED,
                createdAt: mockCreatedCompany.createdAt,
                updatedAt: mockCreatedCompany.updatedAt,
            });
        });
    });

    describe('updateCompany', () => {
        it('should throw ForbiddenException if user does not own the company', async () => {
            const userId = '550e8312-e29b-41d4-a716-446655440000';
            const dto: CompanyUpdateDto = {
                companyId: '550e8412-e29b-41d4-a716-446655440000',
                organizationName: 'Updated Company Name',
            };
            prismaMock.userCompany.findFirst.mockResolvedValue(null);

            await expect(companyService.updateCompany(userId, dto)).rejects.toThrow(
                ForbiddenException,
            );

            expect(prismaService.userCompany.findFirst).toHaveBeenCalledWith({
                where: { userId, companyId: dto.companyId },
            });
            expect(prismaService.company.update).not.toHaveBeenCalled();
        });

        it('should update the company if user owns it', async () => {
            const userId = '550e8312-e29b-41d4-a716-446655440000';
            const dto: CompanyUpdateDto = {
                companyId: '550e8412-e29b-41d4-a716-446655440000',
                organizationName: 'ООО СПЕЙС ГРУПП',
            };

            prismaMock.userCompany.findFirst.mockResolvedValue({
                id: '1',
                userId: userId,
                companyId: dto.companyId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const mockUpdatedCompany: Company = {
                ...mockCompany,
                organizationName: dto.organizationName,
                updatedAt: new Date('2025-01-01T12:00:00.000Z'),
            };

            prismaMock.company.update.mockResolvedValue(mockUpdatedCompany);

            const result = await companyService.updateCompany(userId, dto);

            expect(prismaService.userCompany.findFirst).toHaveBeenCalledWith({
                where: { userId, companyId: dto.companyId },
            });

            expect(prismaService.company.update).toHaveBeenCalledWith({
                where: { id: dto.companyId },
                data: dto,
            });

            expect(result).toEqual({
                id: mockUpdatedCompany.id,
                directorFirstName: mockUpdatedCompany.directorFirstName,
                directorLastName: mockUpdatedCompany.directorLastName,
                directorPatronymic: mockUpdatedCompany.directorPatronymic,
                inn: mockUpdatedCompany.inn,
                ogrn: mockUpdatedCompany.ogrn,
                organizationName: dto.organizationName,
                country: mockUpdatedCompany.country,
                city: mockUpdatedCompany.city,
                legalAddress: mockUpdatedCompany.legalAddress,
                email: mockUpdatedCompany.email,
                phone: mockUpdatedCompany.phone,
                description: mockUpdatedCompany.description,
                documentUrl: mockUpdatedCompany.documentUrl,
                status: mockUpdatedCompany.status,
                createdAt: mockUpdatedCompany.createdAt,
                updatedAt: mockUpdatedCompany.updatedAt,
            });
        });
    });
});
