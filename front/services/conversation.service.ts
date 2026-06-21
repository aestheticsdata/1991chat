"use client";

import type { ConversationDetail, ConversationSummary } from "@services/conversation.types";
import * as http from "@services/http/client";

/**
 * Conversation CRUD against the BFF. Scaffolded for the chat UI — the
 * (hand-built) sidebar and chat view consume these; CSRF / 401 handling is the
 * client's job. Dates arrive as ISO-8601 strings.
 */
export const conversationService = {
  list: (): Promise<ConversationSummary[]> => http.get<ConversationSummary[]>("/conversations"),

  create: (title?: string): Promise<ConversationSummary> =>
    http.post<ConversationSummary>("/conversations", title ? { title } : {}),

  get: (id: string): Promise<ConversationDetail> => http.get<ConversationDetail>(`/conversations/${id}`),

  remove: (id: string): Promise<void> => http.del<void>(`/conversations/${id}`),
};
