"use client";

import type { ChatStreamEvent, SendMessageInput } from "@services/chat.types";
import * as http from "@services/http/client";
import { parseError } from "@services/http/errors";
import { readSse } from "@services/http/sse";

/**
 * Stream an assistant reply over SSE. Uses native `fetch` (not `EventSource`,
 * which is GET-only and can't send the CSRF header or a body; not Axios, which
 * can't stream in the browser). Yields typed events; throws `ApiError` if the
 * request is rejected before streaming starts (unknown conversation, expired
 * session, …). Pass an `AbortSignal` to power a stop button.
 *
 *   const controller = new AbortController();
 *   for await (const ev of chatService.streamMessage(input, { signal: controller.signal })) {
 *     if (ev.type === "delta") append(ev.delta);
 *   }
 */
export const chatService = {
  async *streamMessage(
    input: SendMessageInput,
    options: { signal?: AbortSignal } = {},
  ): AsyncGenerator<ChatStreamEvent> {
    const res = await http.rawFetch("/chat", {
      method: "POST",
      body: JSON.stringify(input),
      signal: options.signal,
    });
    if (!res.ok) throw await parseError(res);

    for await (const frame of readSse(res)) {
      if (frame.event === "open") {
        const { userMessageId, assistantMessageId } = parseData(frame.data);
        yield {
          type: "open",
          userMessageId: typeof userMessageId === "string" ? userMessageId : "",
          assistantMessageId: typeof assistantMessageId === "string" ? assistantMessageId : "",
        };
      } else if (frame.event === "done") {
        yield { type: "done" };
      } else if (frame.event === "error") {
        const message = parseData(frame.data).message;
        yield { type: "error", message: typeof message === "string" ? message : "Stream failed" };
      } else {
        const delta = parseData(frame.data).delta;
        if (typeof delta === "string") yield { type: "delta", delta };
      }
    }
  },
};

function parseData(raw: string): {
  delta?: unknown;
  message?: unknown;
  userMessageId?: unknown;
  assistantMessageId?: unknown;
} {
  try {
    return JSON.parse(raw) as {
      delta?: unknown;
      message?: unknown;
      userMessageId?: unknown;
      assistantMessageId?: unknown;
    };
  } catch {
    return {};
  }
}
