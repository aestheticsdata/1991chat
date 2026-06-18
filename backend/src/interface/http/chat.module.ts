import { Module } from '@nestjs/common';
import { StreamChatUseCase } from '@application/chat/stream-chat.use-case';
import { LlmModule } from '@infrastructure/llm/llm.module';
import { ChatController } from '@interface/http/chat.controller';

@Module({
  imports: [LlmModule],
  controllers: [ChatController],
  providers: [StreamChatUseCase],
})
export class ChatModule {}
