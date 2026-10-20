import { Module } from '@nestjs/common';
import { ProjectRealtimeService } from './services/project-realtime.service';

@Module({
  providers: [ProjectRealtimeService],
  exports: [ProjectRealtimeService],
})
export class ProjectRealtimeModule {}