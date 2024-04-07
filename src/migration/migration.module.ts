import { Module } from '@nestjs/common';
import { RolesSeed } from './seeders/roles.seed';
import { CommandModule } from 'nestjs-command';

@Module({
  imports: [CommandModule],
  providers: [RolesSeed],
})
export class MigrationModule {}
