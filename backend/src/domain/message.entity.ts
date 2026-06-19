import { randomUUID } from "node:crypto";
import { MessageRole } from "@domain/message-role";
import { MessageStatus } from "@domain/message-status";

/**
 * A single chat message belonging to a conversation. Assistant messages are
 * built up incrementally as tokens arrive (appendDelta), so content + status
 * are mutable; identity and authorship are not.
 */
export class Message {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: MessageRole,
    public content: string,
    public status: MessageStatus,
    public readonly createdAt: Date,
  ) {}

  /** A finished user turn. */
  static user(conversationId: string, content: string): Message {
    return new Message(randomUUID(), conversationId, "user", content, MessageStatus.Complete, new Date());
  }

  /** A fresh, empty assistant message in the Pending ("thinking") state. */
  static assistantPending(conversationId: string): Message {
    return new Message(randomUUID(), conversationId, "assistant", "", MessageStatus.Pending, new Date());
  }

  appendDelta(delta: string): void {
    this.content += delta;
    if (this.status === MessageStatus.Pending) {
      this.status = MessageStatus.Streaming;
    }
  }

  complete(): void {
    this.status = MessageStatus.Complete;
  }

  fail(): void {
    this.status = MessageStatus.Error;
  }
}
