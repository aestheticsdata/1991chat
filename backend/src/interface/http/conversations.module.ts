import { Module } from '@nestjs/common';
import { ConversationService } from '@application/conversations/conversation.service';
import { ConversationsController } from '@interface/http/conversations.controller';

// The session + CSRF guards have no injected dependencies, so no extra imports
// are needed (the repository ports come from the global PersistenceModule).
@Module({
  controllers: [ConversationsController],
  providers: [ConversationService],
})
export class ConversationsModule {}
