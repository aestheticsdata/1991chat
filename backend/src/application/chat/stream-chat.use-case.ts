import { Injectable, NotFoundException } from "@nestjs/common";
import { Conversation, UNTITLED_CONVERSATION } from "@domain/conversation.entity";
import { Message } from "@domain/message.entity";
import { ChatLlmProvider, ChatPrompt, TokenChunk } from "@domain/ports/chat-llm-provider.port";
import { ConversationRepository } from "@domain/ports/conversation-repository.port";

export interface StreamChatCommand {
  userId: string;
  conversationId: string;
  content: string;
}

/** Everything the streaming phase needs, prepared synchronously up front. */
export interface ChatTurn {
  conversation: Conversation;
  prompt: ChatPrompt;
  assistant: Message;
}

/**
 * Orchestrates one streamed chat turn across two ports (repository + LLM).
 * Split into two phases on purpose:
 *  - start(): ownership check + persist the user message (+ derive a title).
 *    Throws *before* any HTTP response is written, so a bad conversation yields
 *    a clean 404 rather than a half-streamed SSE response.
 *  - stream(): forward LLM tokens, then persist the assistant reply (complete on
 *    success, error + partial content if the stream fails).
 */
@Injectable()
export class StreamChatUseCase {
  constructor(
    private readonly conversations: ConversationRepository,
    private readonly llm: ChatLlmProvider,
  ) {}

  async start(command: StreamChatCommand): Promise<ChatTurn> {
    const conversation = await this.conversations.findWithMessages(command.conversationId);
    if (!conversation || !conversation.belongsTo(command.userId)) {
      throw new NotFoundException("Conversation not found");
    }

    const userMessage = Message.user(conversation.id, command.content);
    await this.conversations.addMessage(userMessage);

    // First user turn of an untitled conversation → derive a title from it.
    if (conversation.messages.length === 0 && conversation.title === UNTITLED_CONVERSATION) {
      await this.conversations.updateTitle(conversation.id, Conversation.deriveTitle(command.content));
    }

    const history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: userMessage.role, content: userMessage.content });

    return {
      conversation,
      prompt: { messages: history },
      assistant: Message.assistantPending(conversation.id),
    };
  }

  async *stream(turn: ChatTurn, signal: AbortSignal): AsyncIterable<TokenChunk> {
    const { assistant } = turn;
    try {
      for await (const chunk of this.llm.stream(turn.prompt, signal)) {
        if (chunk.delta) assistant.appendDelta(chunk.delta);
        yield chunk;
      }
      assistant.complete();
    } catch (error) {
      assistant.fail();
      await this.conversations.addMessage(assistant); // keep the partial, failed reply
      throw error;
    }
    await this.conversations.addMessage(assistant);
  }
}
