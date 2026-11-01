import { Injectable } from '@nestjs/common';
import { ConversationType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(workspaceId: string, userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        workspaceId,
        OR: [
          { type: ConversationType.CHANNEL },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        participants: {
          select: {
            userId: true,
            lastReadAt: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async markRead(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      create: { conversationId, userId, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });
  }

  async unreadCount(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { lastReadAt: true },
    });
    if (!participant) return 0;
    return this.prisma.message.count({
      where: {
        conversationId,
        ...(participant.lastReadAt
          ? { createdAt: { gt: participant.lastReadAt } }
          : {}),
        senderId: { not: userId },
      },
    });
  }

  findAccessible(conversationId: string, userId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { type: ConversationType.CHANNEL, workspace: { members: { some: { userId } } } },
          { type: ConversationType.DM, participants: { some: { userId } } },
        ],
      },
    });
  }

  createChannel(workspaceId: string, createdById: string, name: string, slug: string) {
    return this.prisma.conversation.create({
      data: {
        workspaceId,
        createdById,
        type: ConversationType.CHANNEL,
        name,
        slug,
      },
    });
  }

  findDm(workspaceId: string, dmKey: string) {
    return this.prisma.conversation.findUnique({
      where: { workspaceId_dmKey: { workspaceId, dmKey } },
    });
  }

  createDm(workspaceId: string, createdById: string, dmKey: string, userId: string) {
    return this.prisma.conversation.create({
      data: {
        workspaceId,
        createdById,
        type: ConversationType.DM,
        dmKey,
        participants: {
          create: [{ userId: createdById }, { userId }],
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
  }

  updateChannel(conversationId: string, name: string, slug: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { name, slug },
    });
  }

  archive(conversationId: string) {
    return this.prisma.conversation.delete({ where: { id: conversationId } });
  }
}
