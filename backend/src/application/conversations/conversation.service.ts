import { Injectable, NotFoundException } from "@nestjs/common";
import { Conversation } from "@domain/conversation.entity";
import { ConversationRepository } from "@domain/ports/conversation-repository.port";

/**
 * Application service for conversation CRUD. Enforces ownership: a user can only
 * see/modify their own conversations. Returns NotFound (not Forbidden) for
 * someone else's conversation so we don't leak that it exists.
 */
@Injectable()
export class ConversationService {
  constructor(private readonly conversations: ConversationRepository) {}

  async create(userId: string, title?: string): Promise<Conversation> {
    const conversation = Conversation.create(userId, title);
    await this.conversations.create(conversation);
    return conversation;
  }

  list(userId: string): Promise<Conversation[]> {
    return this.conversations.listByUser(userId);
  }

  async getOwned(userId: string, id: string): Promise<Conversation> {
    const conversation = await this.conversations.findWithMessages(id);
    if (!conversation || !conversation.belongsTo(userId)) {
      throw new NotFoundException("Conversation not found");
    }
    return conversation;
  }

  async delete(userId: string, id: string): Promise<void> {
    const conversation = await this.conversations.findById(id);
    if (!conversation || !conversation.belongsTo(userId)) {
      throw new NotFoundException("Conversation not found");
    }
    await this.conversations.delete(id);
  }
}
