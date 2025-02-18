import { CompanyRequestService } from '../src/modules/company/services/company-request.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRequestCreateDto } from '../src/modules/company/dtos/company.request.create.dto';
import { CompanyRequestStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { CompanyRequestUpdateDto } from '../src/modules/company/dtos/company.request.update.dto';

const prismaMock = {
    companyRequest: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
    },
    user: {
        update: jest.fn(),
    },
};

const mockCompanyRequest = {
    id: '111e1111-e11b-11d4-a111-111111111111',
    userId: '222e2222-e22b-22d4-a222-222222222222',
    companyId: '333e3333-e33b-33d4-a333-333333333333',
    status: CompanyRequestStatus.PENDING,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

const mockUser = {
    id: '222e2222-e22b-22d4-a222-222222222222',
    companyId: null,
};

const mockCompany = {
    id: '333e3333-e33b-33d4-a333-333333333333',
    organizationName: 'MockCompany',
};

describe('CompanyRequestService', () => {
    let service: CompanyRequestService;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyRequestService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<CompanyRequestService>(CompanyRequestService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createRequest', () => {
        it('should create a new company request with status=PENDING', async () => {
            const userId = mockCompanyRequest.userId;
            const createDto: CompanyRequestCreateDto = {
                companyId: mockCompanyRequest.companyId,
            };

            prismaMock.companyRequest.create.mockResolvedValue(mockCompanyRequest);

            const result = await service.createRequest(userId, createDto);

            expect(prismaService.companyRequest.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    companyId: createDto.companyId,
                    status: CompanyRequestStatus.PENDING,
                },
            });
            expect(result).toEqual(mockCompanyRequest);
        });
    });

    describe('updateRequestStatus', () => {
        it('should throw NotFoundException if request does not exist', async () => {
            prismaMock.companyRequest.findUnique.mockResolvedValue(null);

            await expect(
                service.updateRequestStatus('non-existent-id', {
                    status: CompanyRequestStatus.APPROVED,
                }),
            ).rejects.toThrow(NotFoundException);

            expect(prismaService.companyRequest.findUnique).toHaveBeenCalledWith({
                where: { id: 'non-existent-id' },
                include: { user: true },
            });
            expect(prismaService.companyRequest.update).not.toHaveBeenCalled();
        });

        it('should update the request status and user.companyId if approved', async () => {
            prismaMock.companyRequest.findUnique.mockResolvedValue({
                ...mockCompanyRequest,
                user: mockUser,
            });

            const updatedRequest = {
                ...mockCompanyRequest,
                status: CompanyRequestStatus.APPROVED,
            };
            prismaMock.companyRequest.update.mockResolvedValue(updatedRequest);

            const dto: CompanyRequestUpdateDto = {
                status: CompanyRequestStatus.APPROVED,
            };

            const result = await service.updateRequestStatus(mockCompanyRequest.id, dto);

            expect(prismaService.companyRequest.findUnique).toHaveBeenCalledWith({
                where: { id: mockCompanyRequest.id },
                include: { user: true },
            });

            expect(prismaService.companyRequest.update).toHaveBeenCalledWith({
                where: { id: mockCompanyRequest.id },
                data: { status: CompanyRequestStatus.APPROVED },
            });

            expect(prismaService.user.update).toHaveBeenCalledWith({
                where: { id: mockCompanyRequest.userId },
                data: { companyId: mockCompanyRequest.companyId },
            });

            expect(result).toEqual(updatedRequest);
        });

        it('should only update the request status if declined', async () => {
            prismaMock.companyRequest.findUnique.mockResolvedValue({
                ...mockCompanyRequest,
                user: mockUser,
            });

            const declinedRequest = {
                ...mockCompanyRequest,
                status: CompanyRequestStatus.DECLINED,
            };
            prismaMock.companyRequest.update.mockResolvedValue(declinedRequest);

            const dto: CompanyRequestUpdateDto = {
                status: CompanyRequestStatus.DECLINED,
            };

            const result = await service.updateRequestStatus(mockCompanyRequest.id, dto);

            expect(prismaService.companyRequest.update).toHaveBeenCalledWith({
                where: { id: mockCompanyRequest.id },
                data: { status: CompanyRequestStatus.DECLINED },
            });

            expect(prismaService.user.update).not.toHaveBeenCalled();

            expect(result).toEqual(declinedRequest);
        });
    });

    describe('getRequests', () => {
        it('should return all requests if no status is provided', async () => {
            const mockRequests = [mockCompanyRequest, { ...mockCompanyRequest, id: 'other-id' }];
            prismaMock.companyRequest.findMany.mockResolvedValue(mockRequests);

            const result = await service.getRequests();

            expect(prismaService.companyRequest.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: {
                    user: true,
                    company: true,
                },
            });
            expect(result).toEqual(mockRequests);
        });

        it('should return requests filtered by status if status is provided', async () => {
            const mockApproved = {
                ...mockCompanyRequest,
                status: CompanyRequestStatus.APPROVED,
            };
            prismaMock.companyRequest.findMany.mockResolvedValue([mockApproved]);

            const result = await service.getRequests(CompanyRequestStatus.APPROVED);

            expect(prismaService.companyRequest.findMany).toHaveBeenCalledWith({
                where: { status: CompanyRequestStatus.APPROVED },
                include: {
                    user: true,
                    company: true,
                },
            });
            expect(result).toEqual([mockApproved]);
        });
    });
});
