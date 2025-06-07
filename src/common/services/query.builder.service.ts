import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PaginatedResult, QueryBuilderOptions } from '../interfaces/query.builder.interface';

@Injectable()
export class QueryBuilderService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findManyWithPagination<T>(options: QueryBuilderOptions): Promise<PaginatedResult<T>> {
        const {
            model,
            dto,
            defaultSort = { field: 'createdAt', order: 'desc' },
            searchFields = [],
            relations = [],
            customFilters = {},
        } = options;

        const page = dto.page || 1;
        const limit = Math.min(dto.limit || 10, 100);
        const skip = (page - 1) * limit;
        const sortBy = dto.sortBy || defaultSort.field;
        const sortOrder = dto.sortOrder || defaultSort.order;

        const whereClause = this.buildWhereClause(dto, searchFields, customFilters);
        const includeClause = this.buildIncludeClause(relations);
        const modelAccessor = this.databaseService[model as keyof DatabaseService] as any;

        const [items, total] = await Promise.all([
            modelAccessor.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                ...(Object.keys(includeClause).length > 0 && { include: includeClause }),
            }),
            modelAccessor.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    private buildWhereClause(
        dto: any,
        searchFields: string[],
        customFilters: Record<string, any>,
    ): any {
        const whereClause: any = { deletedAt: null };

        if (dto.search && searchFields.length > 0) {
            whereClause.OR = searchFields.map(field => ({
                [field]: { contains: dto.search, mode: 'insensitive' },
            }));
        }

        Object.keys(dto).forEach(key => {
            const value = dto[key];

            if (
                ['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key) ||
                value === undefined ||
                value === null
            ) {
                return;
            }

            if (key.endsWith('Domain') && typeof value === 'string') {
                whereClause[key.replace('Domain', '')] = { endsWith: `@${value}` };
            } else if (key.includes('Date') && typeof value === 'string') {
                whereClause[key] = { gte: new Date(value) };
            } else if (Array.isArray(value)) {
                whereClause[key] = { in: value };
            } else if (typeof value === 'string' && key.includes('Name')) {
                whereClause[key] = { contains: value, mode: 'insensitive' };
            } else {
                whereClause[key] = value;
            }
        });

        Object.assign(whereClause, customFilters);
        return whereClause;
    }

    private buildIncludeClause(relations: string[]): any {
        const includeClause: any = {};
        relations.forEach(relation => {
            if (relation.includes('.')) {
                const parts = relation.split('.');
                let current = includeClause;
                parts.forEach((part, index) => {
                    if (index === parts.length - 1) {
                        current[part] = true;
                    } else {
                        current[part] = current[part] || { include: {} };
                        current = current[part].include;
                    }
                });
            } else {
                includeClause[relation] = true;
            }
        });
        return includeClause;
    }

    async getCount(model: string, filters?: any): Promise<number> {
        const modelAccessor = this.databaseService[model as keyof DatabaseService] as any;
        return modelAccessor.count({
            where: { deletedAt: null, ...filters },
        });
    }
}
