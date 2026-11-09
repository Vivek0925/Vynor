import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';

import { ProjectController } from './controllers/project.controller';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectService } from './services/project.service';
import { ProjectRealtimeModule } from '../realtime/project-realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [WorkspaceModule, ProjectRealtimeModule, NotificationsModule],
  controllers: [ProjectController],
  providers: [ProjectRepository, ProjectService],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
