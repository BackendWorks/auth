import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { MigrationModule } from './migration/migration.module';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.createApplicationContext(MigrationModule, {
    logger: ['error'],
  });
  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
    process.exit(0);
  } catch (err: unknown) {
    logger.error(err, 'Migration');
    await app.close();
    process.exit(1);
  }
}

bootstrap();
