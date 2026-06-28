/**
 * Chat (SSE streaming) types. Types only — the zod schemas live in
 * chat.schema.ts and the `EVENT` value object in chat.constants.ts.
 */

import type { EVENT } from "@services/chat.constants";
import type { chatStreamEventSchema } from "@services/chat.schema";
import type { z } from "zod";

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export type ChatEventType = (typeof EVENT)[keyof typeof EVENT];

/** A parsed chat SSE event, inferred from the zod schema. */
export type ChatStreamEvent = z.infer<typeof chatStreamEventSchema>;
