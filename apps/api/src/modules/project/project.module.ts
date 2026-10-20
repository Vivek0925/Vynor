import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';

import { ProjectController } from './controllers/project.controller';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectService } from './services/project.service';
import { ProjectRealtimeModule } from '../realtime/project-realtime.module';

@Module({
  imports: [WorkspaceModule, ProjectRealtimeModule],
  controllers: [ProjectController],
  providers: [ProjectRepository, ProjectService],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}