import { randomUUID } from "node:crypto";
import { Message } from "@domain/message.entity";

/** Default title used until the first user message gives us something better. */
export const UNTITLED_CONVERSATION = "New conversation";

/**
 * A conversation aggregate: metadata plus its ordered messages. Owned by a user.
 * `messages` is only populated when explicitly loaded (e.g. for the detail view
 * or to build a prompt); list views leave it empty.
 */
export class Conversation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public messages: Message[] = [],
  ) {}

  static create(userId: string, title: string = UNTITLED_CONVERSATION): Conversation {
    const now = new Date();
    return new Conversation(randomUUID(), userId, title || UNTITLED_CONVERSATION, now, now);
  }

  /** Derive a short title from the first user message (best-effort). */
  static deriveTitle(content: string, max = 60): string {
    const oneLine = content.replace(/\s+/g, " ").trim();
    if (!oneLine) return UNTITLED_CONVERSATION;
    return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max - 1)}…`;
  }

  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }
}
