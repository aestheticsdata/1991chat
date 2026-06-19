import { MessageRole } from "@domain/message-role";

/** A single streamed token (or small group of tokens) from the LLM. */
export interface TokenChunk {
  /** Text to append to the assistant message. Empty on the terminal chunk. */
  delta: string;
  /** True on the final chunk of a successful stream. */
  done?: boolean;
}

/** Provider-agnostic prompt: the conversation so far. */
export interface ChatPrompt {
  messages: { role: MessageRole; content: string }[];
}

/**
 * OUTBOUND PORT. The application depends on this abstraction, never on a
 * concrete LLM. Adapters (mock today, a vendor-neutral HTTP provider later)
 * implement it.
 *
 * Declared as an abstract class so it doubles as a NestJS DI token:
 *   { provide: ChatLlmProvider, useClass: MockLlmAdapter }
 */
export abstract class ChatLlmProvider {
  /**
   * Stream the assistant's reply token-by-token.
   * @param signal aborted when the client disconnects / hits stop — the adapter
   *               must stop producing (and, for a real provider, cancel the
   *               upstream request) promptly.
   */
  abstract stream(prompt: ChatPrompt, signal: AbortSignal): AsyncIterable<TokenChunk>;
}
