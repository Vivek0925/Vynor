import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';

import { ProjectController } from './controllers/project.controller';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectService } from './services/project.service';

@Module({
  imports: [WorkspaceModule],
  controllers: [ProjectController],
  providers: [ProjectRepository, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}