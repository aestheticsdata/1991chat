"use client";

/** One parsed SSE frame: its optional `event:` name and concatenated `data:` payload. */
export interface SseFrame {
  event: string | null;
  data: string;
}

/**
 * Parse a `text/event-stream` Response body into frames using the native
 * streaming APIs (`ReadableStream` reader + `TextDecoder`). Frames are separated
 * by a blank line; `data:` lines within a frame are concatenated. This is what
 * `fetch`-based SSE looks like — `EventSource` can't be used here (it's GET-only
 * and can't send a body or the CSRF header).
 */
export async function* readSse(res: Response): AsyncGenerator<SseFrame> {
  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    let chunk = await reader.read();
    while (!chunk.done) {
      buffer += decoder.decode(chunk.value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = parseFrame(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (frame) yield frame;
        boundary = buffer.indexOf("\n\n");
      }

      chunk = await reader.read();
    }
  } finally {
    reader.releaseLock();
  }
}

function parseFrame(raw: string): SseFrame | null {
  let event: string | null = null;
  const data: string[] = [];

  for (const line of raw.split("\n")) {
    if (line === "" || line.startsWith(":")) continue; // blank / heartbeat comment
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  }

  if (event === null && data.length === 0) return null;
  return { event, data: data.join("\n") };
}
