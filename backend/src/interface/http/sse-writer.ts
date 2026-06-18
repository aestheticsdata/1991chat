import { MessageStatus } from '@domain/message-status';
import { TokenChunk } from '@domain/ports/chat-llm-provider.port';

/**
 * Minimal subset of the express Response we need — keeps this util testable and
 * decoupled from the framework.
 */
export interface SseResponse {
  setHeader(name: string, value: string): void;
  write(chunk: string): boolean;
  end(): void;
  flushHeaders?(): void;
  writableEnded: boolean;
}

function frame(event: string | null, data: unknown): string {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return (event ? `event: ${event}\n` : '') + `data: ${payload}\n\n`;
}

/**
 * Pipe an async token stream to an HTTP response as Server-Sent Events — the
 * same wire format a real LLM proxy emits, so the frontend can be built against
 * it directly.
 *
 * Events:
 *   open   { status: 'pending' }   sent immediately (lets the UI show "thinking")
 *   <data> { delta: '...' }        one per token chunk
 *   done   { status: 'complete' }  clean end
 *   error  { status: 'error', message }  the provider threw mid-stream
 */
export async function writeSse(res: SseResponse, stream: AsyncIterable<TokenChunk>): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // don't let nginx buffer the stream
  res.flushHeaders?.();

  // Flush an opening event so the client reacts before the first token — matters
  // for the long "pending" scenario.
  res.write(frame('open', { status: MessageStatus.Pending }));

  try {
    for await (const chunk of stream) {
      if (res.writableEnded) break;
      if (chunk.done) continue; // terminal marker; we emit our own `done` below
      res.write(frame(null, { delta: chunk.delta }));
    }
    if (!res.writableEnded) {
      res.write(frame('done', { status: MessageStatus.Complete }));
    }
  } catch (error) {
    if (!res.writableEnded) {
      const message = error instanceof Error ? error.message : 'stream failed';
      res.write(frame('error', { status: MessageStatus.Error, message }));
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
}
