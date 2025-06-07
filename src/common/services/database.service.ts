import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);

    async onModuleInit(): Promise<void> {
        try {
            await this.$connect();
            this.logger.log('✅ Database connection established');
        } catch (error) {
            this.logger.error('❌ Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy(): Promise<void> {
        try {
            await this.$disconnect();
            this.logger.log('🔌 Database connection closed');
        } catch (error) {
            this.logger.error('❌ Error closing database connection', error);
        }
    }

    async isHealthy(): Promise<HealthIndicatorResult> {
        try {
            await this.$queryRaw`SELECT 1`;
            return {
                database: {
                    status: 'up',
                    connection: 'active',
                },
            };
        } catch (error) {
            this.logger.error('Database health check failed', error);
            return {
                database: {
                    status: 'down',
                    connection: 'failed',
                    error: error.message,
                },
            };
        }
    }
}
