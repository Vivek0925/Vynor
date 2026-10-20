import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class ProjectRealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitProjectCreated(workspaceId: string, projectId: string) {
    this.emit(workspaceId, 'project:created', { projectId });
  }

  emitProjectUpdated(workspaceId: string, projectId: string) {
    this.emit(workspaceId, 'project:updated', { projectId });
  }

  emitProjectDeleted(workspaceId: string, projectId: string) {
    this.emit(workspaceId, 'project:deleted', { projectId });
  }

  private emit(workspaceId: string, event: string, payload: unknown) {
    this.server?.to(`workspace:${workspaceId}`).emit(event, payload);
  }
}