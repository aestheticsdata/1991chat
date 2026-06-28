/**
 * zod schemas for the chat SSE stream — validation of what the backend sends.
 * Built from the `EVENT` / `STATUS` constant objects. The inferred TypeScript
 * types live in chat.types.ts.
 */

import { EVENT } from "@services/chat.constants";
import { STATUS } from "@services/conversation.constants";
import { z } from "zod";

// The backend frames the stream as: an `open` event (the persisted user +
// assistant message ids and the assistant message's initial status — `pending`
// until the first token), a run of token deltas, then a terminal `done` or
// `error`. Missing/invalid fields fall back (`.catch`) so a single malformed
// frame can't tear down the stream.
const openEvent = z.object({
  type: z.literal(EVENT.OPEN),
  userMessageId: z.string().catch(""),
  assistantMessageId: z.string().catch(""),
  status: z.enum(STATUS).catch(STATUS.PENDING),
});
const deltaEvent = z.object({
  type: z.literal(EVENT.DELTA),
  delta: z.string(),
});
const doneEvent = z.object({
  type: z.literal(EVENT.DONE),
});
const errorEvent = z.object({
  type: z.literal(EVENT.ERROR),
  message: z.string().catch("Stream failed"),
});

/** A parsed chat SSE event — the discriminated union of the four shapes above. */
export const chatStreamEventSchema = z.discriminatedUnion("type", [openEvent, deltaEvent, doneEvent, errorEvent]);
