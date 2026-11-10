import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';
import { PrismaModule } from '../../database/prisma.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [WorkspaceModule, PrismaModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
