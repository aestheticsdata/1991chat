/**
 * Conversation + message DTOs — the serialized shapes the BFF returns. Dates
 * arrive as ISO-8601 strings over the wire (not `Date` objects).
 */

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "pending" | "streaming" | "complete" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: Message[];
}
