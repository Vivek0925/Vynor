import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { NotificationRealtimeService } from './notification-realtime.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: NotificationRealtimeService,
  ) {}

  findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        OR: [
          { meetingId: null, projectId: null, taskId: null },
          { meeting: { status: 'SCHEDULED' } },
          { project: { isNot: null } },
          { task: { is: { isCompleted: false } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createMeetingScheduled(
    meetingId: string,
    workspaceId: string,
    creatorId: string,
    title: string,
    scheduledAt: Date,
  ) {
    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        userId: { not: creatorId },
      },
      select: { userId: true },
    });

    if (members.length === 0) return;

    const formattedDate = scheduledAt.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });

    const notifications = members.map(({ userId }) => ({
      userId,
      type: NotificationType.MEETING_SCHEDULED,
      title: 'New meeting scheduled',
      message: `${title} starts on ${formattedDate} IST.`,
      meetingId,
    }));

    await this.prisma.notification.createMany({ data: notifications });

    const createdNotifications = await this.prisma.notification.findMany({
      where: { meetingId, userId: { in: members.map(({ userId }) => userId) } },
      orderBy: { createdAt: 'desc' },
      take: members.length,
    });

    for (const notification of createdNotifications) {
      this.realtime.emitToUser(notification.userId, notification);
    }
  }

  async createProjectCreated(
    projectId: string,
    workspaceId: string,
    creatorId: string,
    projectName: string,
  ) {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId, userId: { not: creatorId } },
      select: { userId: true },
    });

    await this.createForUsers(
      members.map(({ userId }) => userId),
      {
        type: NotificationType.PROJECT_CREATED,
        title: 'New project created',
        message: `${projectName} was added to the workspace.`,
        projectId,
      },
    );
  }

  async createTaskAssigned(
    taskId: string,
    assigneeId: string,
    taskTitle: string,
    assignerId: string,
  ) {
    if (assigneeId === assignerId) return;

    await this.createForUsers([assigneeId], {
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task assigned to you',
      message: `You were assigned "${taskTitle}".`,
      taskId,
    });
  }

  private async createForUsers(
    userIds: string[],
    data: {
      type: NotificationType;
      title: string;
      message: string;
      meetingId?: string;
      projectId?: string;
      taskId?: string;
    },
  ) {
    if (userIds.length === 0) return;

    const notifications = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, ...data })),
    });

    const createdNotifications = await this.prisma.notification.findMany({
      where: {
        userId: { in: userIds },
        type: data.type,
        ...(data.meetingId ? { meetingId: data.meetingId } : {}),
        ...(data.projectId ? { projectId: data.projectId } : {}),
        ...(data.taskId ? { taskId: data.taskId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: notifications.count,
    });

    for (const notification of createdNotifications) {
      this.realtime.emitToUser(notification.userId, notification);
    }
  }
}
