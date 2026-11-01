import { Module } from "@nestjs/common";

import { WorkspaceModule } from "../workspace/workspace.module";

import { ChatService } from "./services/chat.service";
import { MessageRepository } from "./repositories/message.repository";
import { ConversationRepository } from "./repositories/conversation.repository";
import { ChatController } from "./controllers/chat.controller";
import { ConversationController } from "./controllers/conversation.controller";
import { StorageModule } from '../storage/storage.module';
@Module({
  imports: [
    WorkspaceModule,
    StorageModule,
  ],
  controllers: [
    ChatController,
    ConversationController,
  ],
  providers: [
    ChatService,
    MessageRepository,
    ConversationRepository,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {}