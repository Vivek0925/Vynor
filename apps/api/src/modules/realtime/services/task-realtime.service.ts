import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class TaskRealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitTaskCreated(workspaceId: string, task: unknown) {
    this.emit(workspaceId, 'task:created', task);
  }

  emitTaskUpdated(workspaceId: string, task: unknown) {
    this.emit(workspaceId, 'task:updated', task);
  }

  emitTaskMoved(workspaceId: string, task: unknown) {
    this.emit(workspaceId, 'task:moved', task);
  }

  emitTaskDeleted(workspaceId: string, taskId: string) {
    this.emit(workspaceId, 'task:deleted', { id: taskId });
  }

  
  emitTaskCommentCreated(
    workspaceId: string,
    comment: unknown,
  ) {
    this.emit(workspaceId, 'task:comment:created', comment);
  }


  private emit(workspaceId: string, event: string, payload: unknown) {
    this.server
      ?.to(`workspace:${workspaceId}`)
      .emit(event, payload);
  }
}