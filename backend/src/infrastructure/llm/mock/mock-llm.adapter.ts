import { Inject, Injectable } from "@nestjs/common";
import { ChatLlmProvider, ChatPrompt, TokenChunk } from "@domain/ports/chat-llm-provider.port";
import { APP_CONFIG, AppConfig } from "@infrastructure/config/configuration";
import { getMockSentences } from "@infrastructure/llm/mock/mock-corpus";
import { Scenario, scenarioFromText } from "@infrastructure/llm/mock/scenario";

/**
 * Mock LLM adapter. Streams a random reply — clean standalone sentences drawn at
 * random from a corpus, arranged into a randomly-shaped mix of paragraphs (some
 * long) with occasional simple Markdown — in small, uneven token-like chunks to
 * imitate a real provider. A keyword in the chat message ("/error", "/slow",
 * "/pending") triggers the matching scenario; anything else streams a normal
 * reply. Scenario selection is deliberately confined to this mock double — the
 * real RemoteLlmAdapter has none, and the domain/application never see scenarios.
 */
@Injectable()
export class MockLlmAdapter extends ChatLlmProvider {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    super();
  }

  async *stream(prompt: ChatPrompt, signal: AbortSignal): AsyncIterable<TokenChunk> {
    const { mock } = this.config;
    const scenario = this.resolveScenario(prompt);

    // (A) Pending: hold before emitting the first token.
    if (scenario === "pending") {
      await this.delay(mock.pendingDelayMs, signal);
    }

    // Stream-error streams a short, random 1–2 sentence preamble IN FULL before
    // aborting, so a sentence or two visibly arrives ahead of the failure rather
    // than just a couple of stray characters.
    const reply = scenario === "stream-error" ? this.buildErrorPreamble() : this.buildReply();
    // Split into uneven, token-like chunks (imitating a real BPE token stream
    // rather than whole words). The chunks still concatenate back to the source
    // text exactly, so the assembled UI bubble is unchanged.
    const chunks = fakeTokenize(reply);
    const perTokenDelay = scenario === "slow" ? mock.slowTokenDelayMs : mock.tokenDelayMs;

    for (const chunk of chunks) {
      if (signal.aborted) return; // (stop button) — stop producing
      await this.delay(perTokenDelay, signal);
      if (signal.aborted) return;
      yield { delta: chunk };
    }

    // (B) Stream error: blow up only after the whole preamble has streamed.
    if (scenario === "stream-error") {
      throw new Error("Simulated upstream LLM failure (mock stream-error scenario).");
    }

    yield { delta: "", done: true };
  }

  /**
   * The stream-error preamble: one or two clean sentences (count rolled at
   * random) drawn from the corpus — a short burst of real text, then the loop
   * throws right away so the error lands immediately after the last token.
   */
  private buildErrorPreamble(): string {
    const nextSentence = makeSentencePicker(getMockSentences(this.config.mock.corpusPath));
    const count = 1 + Math.floor(Math.random() * 2); // 1..2 sentences
    return takeSentences(nextSentence, count).join(" ");
  }

  /** A "/error" | "/slow" | "/pending" keyword in the latest user message selects the scenario; default "normal". */
  private resolveScenario(prompt: ChatPrompt): Scenario {
    const lastUser = [...prompt.messages].reverse().find((m) => m.role === "user");
    return (lastUser && scenarioFromText(lastUser.content)) || "normal";
  }

  /**
   * A reply whose shape is randomised at every level: a random number of blocks
   * (1–5), each independently a paragraph of random length — or, now and then, a
   * SHORT list or a blockquote (no headings). Markdown structure is an occasional
   * accent, not a per-reply fixture: ~30% of replies are plain prose,
   * and lists/quotes show up in only a minority of the rest. So one reply might be
   * a single short paragraph, another three paragraphs of mixed length, another a
   * paragraph + a short bullet list + a quote. Inline emphasis (bold/italic/code)
   * is sprinkled in. Sentences are picked at random, no repeats within a reply;
   * blocks are separated by a blank line.
   */
  private buildReply(): string {
    const nextSentence = makeSentencePicker(getMockSentences(this.config.mock.corpusPath));

    // A reply is a random number of blocks. Most blocks are plain paragraphs (of
    // varied length); Markdown structure — a heading, a SHORT list, a blockquote —
    // shows up only now and then, so lists/quotes are occasional accents rather
    // than something in every reply. ~30% of replies stay plain prose entirely.
    const useMarkdown = Math.random() < 0.7;
    const blocks: string[] = [];

    const blockCount = randomBlockCount();
    for (let b = 0; b < blockCount; b++) {
      blocks.push(useMarkdown ? randomBlock(nextSentence) : plainParagraph(nextSentence));
    }

    return blocks.join("\n\n");
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

/** Number of body blocks in a reply — weighted toward 2–4 so shapes vary and mix. */
function randomBlockCount(): number {
  const r = Math.random();
  if (r < 0.2) return 1;
  if (r < 0.45) return 2;
  if (r < 0.7) return 3;
  if (r < 0.88) return 4;
  return 5;
}

/** One paragraph's length, rolled independently: ~35% short, ~40% medium, ~25% long. */
function randomParagraphLength(): number {
  const r = Math.random();
  if (r < 0.4) return 2 + Math.floor(Math.random() * 3); // short: 2..4
  if (r < 0.8) return 4 + Math.floor(Math.random() * 4); // medium: 4..7
  return 8 + Math.floor(Math.random() * 3); // long: 8..10
}

/** A non-repeating sentence picker over the pool (allows a repeat once exhausted). */
function makeSentencePicker(pool: string[]): () => string {
  const used = new Set<string>();
  return () => {
    for (let guard = 0; guard < 12; guard++) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }
    return pool[Math.floor(Math.random() * pool.length)]; // pool ~exhausted: allow a repeat
  };
}

/** Pull n fresh, non-repeating sentences. */
function takeSentences(next: () => string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(next());
  return out;
}

/** A plain prose paragraph of random length (used for non-Markdown replies). */
function plainParagraph(next: () => string): string {
  return takeSentences(next, randomParagraphLength()).join(" ");
}

/**
 * One Markdown block, type chosen at random and INDEPENDENTLY per block: usually
 * a paragraph (any length), and only now and then a SHORT bullet/numbered list
 * (2–5 items) or a 1–3 sentence blockquote. Lists are deliberately short — they
 * never swallow a whole long paragraph — and rare enough that they don't appear
 * in every reply. Light inline emphasis is sprinkled throughout.
 */
function randomBlock(next: () => string): string {
  const r = Math.random();
  if (r < 0.06) {
    return takeSentences(next, 2 + Math.floor(Math.random() * 4))
      .map((s) => `- ${withInlineEmphasis(s)}`)
      .join("\n"); // bullet list, 2..5 items
  }
  if (r < 0.1) {
    return takeSentences(next, 2 + Math.floor(Math.random() * 4))
      .map((s, i) => `${i + 1}. ${withInlineEmphasis(s)}`)
      .join("\n"); // numbered list, 2..5 items
  }
  if (r < 0.16) {
    return `> ${takeSentences(next, 1 + Math.floor(Math.random() * 3))
      .map(withInlineEmphasis)
      .join(" ")}`; // blockquote, 1..3 sentences
  }
  return takeSentences(next, randomParagraphLength()).map(withInlineEmphasis).join(" "); // paragraph
}

/** ~45% of the time, wrap one interior word in bold, italic, or inline code. */
function withInlineEmphasis(sentence: string): string {
  if (Math.random() < 0.55) return sentence;
  const words = sentence.split(" ");
  if (words.length < 4) return sentence;
  const i = 1 + Math.floor(Math.random() * (words.length - 2)); // skip first/last word
  const parts = words[i].match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}'’-]+)([^\p{L}\p{N}]*)$/u);
  if (!parts) return sentence;
  const marker = pickMarker();
  words[i] = `${parts[1]}${marker}${parts[2]}${marker}${parts[3]}`;
  return words.join(" ");
}

/** Bold most often, then italic, occasionally inline code. */
function pickMarker(): string {
  const r = Math.random();
  if (r < 0.45) return "**";
  if (r < 0.85) return "*";
  return "`";
}

/**
 * Fake-but-realistic tokenization for the mock. Pre-splits like a tokenizer
 * (leading whitespace stays glued to its word; digits and punctuation stand
 * apart), then chops longer words into 3–4 char sub-word pieces. Short
 * words/punctuation stay whole. The pieces concatenate back to the exact source
 * text, so nothing is lost or doubled in the assembled reply.
 */
function fakeTokenize(text: string): string[] {
  const pieces = text.match(/\s*\p{L}+|\s*\p{N}+|\s*[^\s\p{L}\p{N}]+|\s+/gu) ?? [];
  const tokens: string[] = [];
  for (const piece of pieces) {
    if (piece.trim().length <= 4) {
      tokens.push(piece); // short word / punctuation → a single token
      continue;
    }
    for (let i = 0; i < piece.length; ) {
      const size = 3 + Math.floor(Math.random() * 2); // 3..4 chars
      tokens.push(piece.slice(i, i + size));
      i += size;
    }
  }
  return tokens;
}
