import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationType } from '@prisma/client';

import { WorkspaceService } from '../../workspace/services/workspace.service';
import { MessageRepository } from '../repositories/message.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import { ReactMessageDto } from '../dto/react-message.dto';
import { StorageService } from '../../storage/storage.service';
import { ConversationRepository } from '../repositories/conversation.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly messageRepository: MessageRepository,
    private readonly storageService: StorageService,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async createMessage(senderId: string, dto: SendMessageDto) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      senderId,
      dto.workspaceSlug,
    );

    let conversationId = dto.conversationId;
    if (conversationId) {
      const conversation = await this.conversationRepository.findAccessible(
        conversationId,
        senderId,
      );
      if (!conversation || conversation.workspaceId !== workspace.id) {
        throw new NotFoundException('Conversation not found.');
      }
    } else {
      const general = await this.conversationRepository.findAccessible(
        `general_${workspace.id}`,
        senderId,
      );
      conversationId = general?.id;
    }

    return this.messageRepository.create({
      content: dto.content,
      workspaceId: workspace.id,
      senderId,
      attachments: dto.attachments,
      replyToId: dto.replyToId,
      conversationId,
    });
  }

  async getWorkspaceMessages(
    userId: string,
    workspaceSlug: string,
    conversationId?: string,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    if (conversationId) {
      const conversation = await this.conversationRepository.findAccessible(
        conversationId,
        userId,
      );
      if (!conversation || conversation.workspaceId !== workspace.id) {
        throw new NotFoundException('Conversation not found.');
      }
    }

    return this.messageRepository.findWorkspaceMessages(
      workspace.id,
      conversationId,
    );
  }

  async listConversations(userId: string, workspaceSlug: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(userId, workspaceSlug);
    const conversations = await this.conversationRepository.listForUser(workspace.id, userId);
    return Promise.all(
      conversations.map(async (conversation) => ({
        ...conversation,
        unreadCount: await this.conversationRepository.unreadCount(conversation.id, userId),
      })),
    );
  }

  async markConversationRead(userId: string, conversationId: string) {
    const conversation = await this.conversationRepository.findAccessible(conversationId, userId);
    if (!conversation) throw new NotFoundException('Conversation not found.');
    return this.conversationRepository.markRead(conversationId, userId);
  }

  async getAccessibleConversation(userId: string, conversationId: string) {
    return this.conversationRepository.findAccessible(conversationId, userId);
  }

  async createChannel(userId: string, workspaceSlug: string, name: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(userId, workspaceSlug);
    if (!(await this.workspaceService.isWorkspaceAdminOrOwner(workspace.id, userId))) {
      throw new NotFoundException('Conversation not found.');
    }
    const normalized = name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    if (!normalized) throw new BadRequestException('Channel name is required.');
    return this.conversationRepository.createChannel(workspace.id, userId, name.trim(), normalized);
  }

  async createDirectMessage(userId: string, workspaceSlug: string, targetUserId: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(userId, workspaceSlug);
    if (userId === targetUserId || !(await this.workspaceService.isMember(workspace.id, targetUserId))) {
      throw new NotFoundException('Member not found.');
    }
    const dmKey = [userId, targetUserId].sort().join(':');
    const existing = await this.conversationRepository.findDm(workspace.id, dmKey);
    return existing ?? this.conversationRepository.createDm(workspace.id, userId, dmKey, targetUserId);
  }

  async renameChannel(userId: string, conversationId: string, name: string) {
    const conversation = await this.conversationRepository.findAccessible(conversationId, userId);
    if (!conversation || conversation.type !== ConversationType.CHANNEL ||
        !(await this.workspaceService.isWorkspaceAdminOrOwner(conversation.workspaceId, userId))) {
      throw new NotFoundException('Conversation not found.');
    }
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    return this.conversationRepository.updateChannel(conversationId, name.trim(), slug);
  }

  async archiveChannel(userId: string, conversationId: string) {
    const conversation = await this.conversationRepository.findAccessible(conversationId, userId);
    if (!conversation || conversation.slug === 'general' ||
        !(await this.workspaceService.isWorkspaceAdminOrOwner(conversation.workspaceId, userId))) {
      throw new NotFoundException('Conversation not found.');
    }
    return this.conversationRepository.archive(conversationId);
  }

  async editMessage(senderId: string, dto: EditMessageDto) {
    const existingMessage = await this.messageRepository.findById(
      dto.messageId,
    );
    if (
      !existingMessage ||
      !(await this.workspaceService.findAccessibleWorkspaceById(
        senderId,
        existingMessage.workspaceId,
      ))
    ) {
      throw new NotFoundException('Message not found.');
    }

    const message = await this.messageRepository.updateOwnedMessage(
      dto.messageId,
      senderId,
      dto.content,
    );

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    return message;
  }

  async deleteMessage(senderId: string, messageId: string) {
    const existingMessage = await this.messageRepository.findById(messageId);
    if (
      !existingMessage ||
      !(await this.workspaceService.findAccessibleWorkspaceById(
        senderId,
        existingMessage.workspaceId,
      ))
    ) {
      throw new NotFoundException('Message not found.');
    }

    const message = await this.messageRepository.deleteOwnedMessage(
      messageId,
      senderId,
    );

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    return message;
  }

  async reactToMessage(userId: string, dto: ReactMessageDto) {
    const message = await this.messageRepository.findById(dto.messageId);
    if (
      !message ||
      !(await this.workspaceService.findAccessibleWorkspaceById(
        userId,
        message.workspaceId,
      ))
    ) {
      throw new NotFoundException('Message not found.');
    }

    return this.messageRepository.toggleReaction(
      dto.messageId,
      userId,
      dto.emoji,
    );
  }

  async getAttachmentDownloadUrl(
    userId: string,
    workspaceSlug: string,
    messageId: string,
    attachmentId: string,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const attachment = await this.messageRepository.findAttachmentForDownload(
      messageId,
      workspace.id,
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }

    const url = await this.storageService.createDownloadUrl(
      attachment.key,
      attachment.fileName,
      attachment.mimeType,
    );

    return { url };
  }

  async getAttachmentPreviewUrl(
    userId: string,
    workspaceSlug: string,
    messageId: string,
    attachmentId: string,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const attachment = await this.messageRepository.findAttachmentForDownload(
      messageId,
      workspace.id,
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }

    const url = await this.storageService.createDownloadUrl(
      attachment.key,
      attachment.fileName,
      attachment.mimeType,
      true,
    );

    return { url };
  }
}
