import { Module } from '@nestjs/common';
import { TaskRealtimeService } from './services/task-realtime.service';

@Module({
  providers: [TaskRealtimeService],
  exports: [TaskRealtimeService],
})
export class TaskRealtimeModule {}