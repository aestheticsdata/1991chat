import { Inject, Injectable } from '@nestjs/common';
import { ChatLlmProvider, ChatPrompt, TokenChunk } from '@domain/ports/chat-llm-provider.port';
import { APP_CONFIG, AppConfig } from '@infrastructure/config/configuration';

/**
 * Vendor-neutral real LLM adapter (STUB). Activated with LLM_PROVIDER=remote.
 * Uses the built-in fetch against LLM_BASE_URL with LLM_API_KEY as a bearer
 * token — no vendor SDK, nothing here names a specific provider.
 *
 * To go live: implement the request body + streaming-response parsing your
 * chosen provider expects, mapping each upstream token event to a TokenChunk.
 * The controller, use-case, and domain need no changes.
 */
@Injectable()
export class RemoteLlmAdapter extends ChatLlmProvider {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    super();
  }

  // eslint-disable-next-line require-yield
  async *stream(prompt: ChatPrompt, signal: AbortSignal): AsyncIterable<TokenChunk> {
    const { baseUrl, apiKey } = this.config.llm;
    if (!baseUrl) {
      throw new Error('LLM_BASE_URL is required when LLM_PROVIDER=remote.');
    }

    // --- TEMPLATE: adapt to your provider's streaming contract ----------------
    // const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    //   method: 'POST',
    //   signal,
    //   headers: {
    //     'content-type': 'application/json',
    //     authorization: `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify({ stream: true, messages: prompt.messages }),
    // });
    // if (!response.ok || !response.body) {
    //   throw new Error(`Upstream LLM error: ${response.status}`);
    // }
    // for await (const event of parseServerSentEvents(response.body)) {
    //   if (signal.aborted) return;
    //   const delta = extractDelta(event); // provider-specific shape
    //   if (delta) yield { delta };
    // }
    // yield { delta: '', done: true };
    // --------------------------------------------------------------------------

    void prompt;
    void signal;
    void apiKey;
    throw new Error('RemoteLlmAdapter is a stub — implement your provider mapping.');
  }
}
