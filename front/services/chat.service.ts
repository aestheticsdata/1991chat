"use client";

import { EVENT } from "@services/chat.constants";
import { chatStreamEventSchema } from "@services/chat.schema";
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
 *     if (ev.type === EVENT.DELTA) append(ev.delta);
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
      // Validate each frame's payload against the schema at the boundary. The
      // `.catch` defaults baked into the event shapes keep a malformed open/error
      // frame from tearing down the stream; a non-string delta is simply skipped.
      const data = parseJson(frame.data);
      if (frame.event === EVENT.OPEN) {
        yield chatStreamEventSchema.parse({ ...data, type: EVENT.OPEN });
      } else if (frame.event === EVENT.DONE) {
        yield { type: EVENT.DONE };
      } else if (frame.event === EVENT.ERROR) {
        yield chatStreamEventSchema.parse({ ...data, type: EVENT.ERROR });
      } else {
        // Token deltas are the unnamed frames.
        const delta = chatStreamEventSchema.safeParse({ ...data, type: EVENT.DELTA });
        if (delta.success) yield delta.data;
      }
    }
  },
};

/** Parse a frame's `data:` JSON into a plain object; `{}` on any non-object or parse error. */
function parseJson(raw: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(raw);
    return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
