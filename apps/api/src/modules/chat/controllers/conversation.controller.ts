import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/interfaces/current-user.interface';
import { CreateChannelDto, CreateDirectMessageDto } from '../dto/create-conversation.dto';
import { ChatService } from '../services/chat.service';

@Controller('workspaces/:slug/conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  list(@Param('slug') slug: string, @CurrentUser() user: CurrentUserData) {
    return this.chatService.listConversations(user.id, slug);
  }

  @Post('channels')
  createChannel(@Param('slug') slug: string, @Body() dto: CreateChannelDto, @CurrentUser() user: CurrentUserData) {
    return this.chatService.createChannel(user.id, slug, dto.name);
  }

  @Post('dms')
  createDirectMessage(@Param('slug') slug: string, @Body() dto: CreateDirectMessageDto, @CurrentUser() user: CurrentUserData) {
    return this.chatService.createDirectMessage(user.id, slug, dto.userId);
  }

  @Patch(':conversationId')
  renameChannel(@Param('conversationId') conversationId: string, @Body() dto: CreateChannelDto, @CurrentUser() user: CurrentUserData) {
    return this.chatService.renameChannel(user.id, conversationId, dto.name);
  }

  @Post(':conversationId/read')
  markRead(@Param('conversationId') conversationId: string, @CurrentUser() user: CurrentUserData) {
    return this.chatService.markConversationRead(user.id, conversationId);
  }

  @Delete(':conversationId')
  archiveChannel(@Param('conversationId') conversationId: string, @CurrentUser() user: CurrentUserData) {
    return this.chatService.archiveChannel(user.id, conversationId);
  }
}
