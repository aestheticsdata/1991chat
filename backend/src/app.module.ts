import { Module } from '@nestjs/common';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { AppConfigModule } from '@infrastructure/config/config.module';
import { LlmModule } from '@infrastructure/llm/llm.module';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { ChatModule } from '@interface/http/chat.module';
import { ConversationsModule } from '@interface/http/conversations.module';

@Module({
  imports: [
    AppConfigModule, // global: validated config
    RedisModule, // global: Redis connection (session store + session clearing)
    PersistenceModule, // global: SQLite + repository ports
    LlmModule, // ChatLlmProvider (mock or remote) + scenario plumbing
    AuthModule, // users, login/register, session establishment
    ConversationsModule, // conversation CRUD
    ChatModule, // streamed chat turns
  ],
})
export class AppModule {}
