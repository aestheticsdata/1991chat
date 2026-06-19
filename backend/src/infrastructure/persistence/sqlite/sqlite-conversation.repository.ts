import { Inject, Injectable } from "@nestjs/common";
import { Conversation } from "@domain/conversation.entity";
import { Message } from "@domain/message.entity";
import { MessageRole } from "@domain/message-role";
import { MessageStatus } from "@domain/message-status";
import { ConversationRepository } from "@domain/ports/conversation-repository.port";
import { SQLITE, SqliteDatabase } from "@infrastructure/persistence/sqlite/database";

interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  status: string;
  created_at: number;
}

/** SQLite adapter for ConversationRepository. Maps rows ↔ domain entities. */
@Injectable()
export class SqliteConversationRepository extends ConversationRepository {
  constructor(@Inject(SQLITE) private readonly db: SqliteDatabase) {
    super();
  }

  async create(conversation: Conversation): Promise<void> {
    this.db
      .prepare("INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
      .run(
        conversation.id,
        conversation.userId,
        conversation.title,
        conversation.createdAt.getTime(),
        conversation.updatedAt.getTime(),
      );
  }

  async findById(id: string): Promise<Conversation | null> {
    const row = this.db.prepare("SELECT * FROM conversations WHERE id = ?").get(id) as ConversationRow | undefined;
    return row ? this.toConversation(row) : null;
  }

  async findWithMessages(id: string): Promise<Conversation | null> {
    const row = this.db.prepare("SELECT * FROM conversations WHERE id = ?").get(id) as ConversationRow | undefined;
    if (!row) return null;

    const conversation = this.toConversation(row);
    const messageRows = this.db
      .prepare(
        // rowid (insertion order) is the tiebreaker: a user message is always
        // inserted before its assistant reply, even when they share a created_at ms.
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC",
      )
      .all(id) as MessageRow[];
    conversation.messages = messageRows.map((m) => this.toMessage(m));
    return conversation;
  }

  async listByUser(userId: string): Promise<Conversation[]> {
    const rows = this.db
      .prepare("SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC")
      .all(userId) as ConversationRow[];
    return rows.map((r) => this.toConversation(r));
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM conversations WHERE id = ?").run(id);
  }

  async addMessage(message: Message): Promise<void> {
    // Insert the message and bump the conversation's updatedAt atomically.
    const tx = this.db.transaction((m: Message) => {
      this.db
        .prepare(
          "INSERT INTO messages (id, conversation_id, role, content, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run(m.id, m.conversationId, m.role, m.content, m.status, m.createdAt.getTime());
      this.db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(Date.now(), m.conversationId);
    });
    tx(message);
  }

  async updateTitle(conversationId: string, title: string): Promise<void> {
    this.db.prepare("UPDATE conversations SET title = ? WHERE id = ?").run(title, conversationId);
  }

  private toConversation(row: ConversationRow): Conversation {
    return new Conversation(row.id, row.user_id, row.title, new Date(row.created_at), new Date(row.updated_at));
  }

  private toMessage(row: MessageRow): Message {
    return new Message(
      row.id,
      row.conversation_id,
      row.role as MessageRole,
      row.content,
      row.status as MessageStatus,
      new Date(row.created_at),
    );
  }
}
