import { Module } from "@nestjs/common";

import { WorkspaceModule } from "../workspace/workspace.module";

import { ChatService } from "./services/chat.service";
import { MessageRepository } from "./repositories/message.repository";
import { ChatController } from "./controllers/chat.controller";
import { StorageModule } from '../storage/storage.module';
@Module({
  imports: [
    WorkspaceModule,
    StorageModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatService,
    MessageRepository,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {}