import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";
import { paragraph, sentence } from "txtgen";
import { ChatLlmProvider, ChatPrompt, TokenChunk } from "@domain/ports/chat-llm-provider.port";
import { APP_CONFIG, AppConfig } from "@infrastructure/config/configuration";
import { parseScenario, Scenario } from "@infrastructure/llm/mock/scenario";

/**
 * Mock LLM adapter. Generates random English sentences with txtgen and streams
 * them word-by-word to imitate a real provider. Reads the per-request scenario
 * (x-mock-scenario header / ?scenario= query) to simulate pending /
 * mid-stream-error / slow behaviours on demand.
 *
 * Request-scoped, and injects the HTTP request to read the scenario. That HTTP
 * coupling is deliberately confined to this mock double — the real
 * RemoteLlmAdapter has none, and the domain/application never see scenarios.
 * The API key is required (mirrors a real provider) even though the mock never
 * calls out.
 */
@Injectable({ scope: Scope.REQUEST })
export class MockLlmAdapter extends ChatLlmProvider {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {
    super();
  }

  async *stream(prompt: ChatPrompt, signal: AbortSignal): AsyncIterable<TokenChunk> {
    const { mock } = this.config;
    const scenario = this.resolveScenario(mock.defaultScenario);

    // (A) Pending: hold before emitting the first token.
    if (scenario === "pending") {
      await this.delay(mock.pendingDelayMs, signal);
    }

    const reply = this.buildReply(prompt);
    // Split on words but KEEP trailing whitespace, so the joined chunks equal
    // the source text exactly (no lost/doubled spaces in the UI bubble).
    const chunks = reply.match(/\S+\s*/g) ?? [];
    const perTokenDelay = scenario === "slow" ? mock.slowTokenDelayMs : mock.tokenDelayMs;

    let emitted = 0;
    for (const chunk of chunks) {
      if (signal.aborted) return; // (stop button) — stop producing
      await this.delay(perTokenDelay, signal);
      if (signal.aborted) return;

      // (B) Stream error: blow up partway through.
      if (scenario === "stream-error" && emitted >= mock.errorAfterTokens) {
        throw new Error("Simulated upstream LLM failure (mock stream-error scenario).");
      }

      yield { delta: chunk };
      emitted++;
    }

    yield { delta: "", done: true };
  }

  /** header beats query beats the configured default. */
  private resolveScenario(fallback: Scenario): Scenario {
    const header = this.request.headers["x-mock-scenario"];
    const query = this.request.query?.scenario;
    const requested =
      (typeof header === "string" ? header : undefined) ?? (typeof query === "string" ? query : undefined);
    return parseScenario(requested, fallback);
  }

  /** A 2–4 sentence reply that loosely echoes the user's last message. */
  private buildReply(prompt: ChatPrompt): string {
    const lastUser = [...prompt.messages].reverse().find((m) => m.role === "user");
    const body = paragraph(2 + Math.floor(Math.random() * 3)); // 2..4 sentences
    if (!lastUser) return body;
    return `${sentence()} (You said: "${truncate(lastUser.content, 50)}".) ${body}`;
  }

  /** setTimeout that also resolves promptly when the request is aborted. */
  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (signal.aborted || ms <= 0) return resolve();
      const onAbort = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
