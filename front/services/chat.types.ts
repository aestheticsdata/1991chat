/**
 * Chat (SSE streaming) DTOs.
 */

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

/**
 * A parsed chat SSE event. The backend frames the stream as: an `open` event,
 * a run of unnamed token deltas, then a terminal `done` or `error`.
 */
export type ChatStreamEvent =
  | { type: "open" }
  | { type: "delta"; delta: string }
  | { type: "done" }
  | { type: "error"; message: string };
