/**
 * Conversation + message DTOs — the serialized shapes the BFF returns. Dates
 * arrive as ISO-8601 strings over the wire (not `Date` objects).
 *
 * Types only. The `ROLE` / `STATUS` value objects live in
 * conversation.constants.ts; the role/status types are derived from them.
 */

import type { ROLE, STATUS } from "@services/conversation.constants";

export type MessageRole = (typeof ROLE)[keyof typeof ROLE];
export type MessageStatus = (typeof STATUS)[keyof typeof STATUS];

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

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
