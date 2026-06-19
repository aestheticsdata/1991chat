import { Conversation } from "@domain/conversation.entity";
import { Message } from "@domain/message.entity";

/**
 * OUTBOUND PORT for conversation + message persistence. Async for the same
 * reason as UserRepository: the contract stays storage-agnostic even though the
 * current adapter (SQLite) is synchronous under the hood.
 */
export abstract class ConversationRepository {
  abstract create(conversation: Conversation): Promise<void>;

  /** Metadata only (no messages). Used for ownership checks. */
  abstract findById(id: string): Promise<Conversation | null>;

  /** Conversation with its ordered messages. Used for the detail view + prompt. */
  abstract findWithMessages(id: string): Promise<Conversation | null>;

  /** A user's conversations, newest activity first, without messages. */
  abstract listByUser(userId: string): Promise<Conversation[]>;

  abstract delete(id: string): Promise<void>;

  /** Insert a message and bump the conversation's updatedAt in one step. */
  abstract addMessage(message: Message): Promise<void>;

  abstract updateTitle(conversationId: string, title: string): Promise<void>;
}
