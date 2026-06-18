import { Global, Module } from '@nestjs/common';
import { ConversationRepository } from '@domain/ports/conversation-repository.port';
import { UserRepository } from '@domain/ports/user-repository.port';
import { APP_CONFIG, AppConfig } from '@infrastructure/config/configuration';
import { createDatabase, SQLITE } from '@infrastructure/persistence/sqlite/database';
import { SqliteConversationRepository } from '@infrastructure/persistence/sqlite/sqlite-conversation.repository';
import { SqliteUserRepository } from '@infrastructure/persistence/sqlite/sqlite-user.repository';

/**
 * Global persistence module. Opens one SQLite connection and binds the domain
 * repository ports to their SQLite adapters. To move off SQLite later, swap the
 * two `useClass` bindings — nothing in domain/application changes.
 */
@Global()
@Module({
  providers: [
    {
      provide: SQLITE,
      useFactory: (config: AppConfig) => createDatabase(config.databasePath),
      inject: [APP_CONFIG],
    },
    { provide: UserRepository, useClass: SqliteUserRepository },
    { provide: ConversationRepository, useClass: SqliteConversationRepository },
  ],
  exports: [UserRepository, ConversationRepository],
})
export class PersistenceModule {}
