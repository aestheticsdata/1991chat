import type { TokenChunk } from "@domain/ports/chat-llm-provider.port";
import { writeSse } from "@interface/http/sse-writer";
import { describe, expect, it } from "vitest";

/** A minimal in-memory stand-in for the express Response, capturing what's written. */
function fakeResponse() {
  const chunks: string[] = [];
  const headers: Record<string, string> = {};
  let ended = false;
  const res = {
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    write(chunk: string) {
      chunks.push(chunk);
      return true;
    },
    end() {
      ended = true;
    },
    flushHeaders() {},
    get writableEnded() {
      return ended;
    },
  };
  return {
    res,
    headers,
    output: () => chunks.join(""),
    ended: () => ended,
  };
}

async function* tokens(...chunks: TokenChunk[]): AsyncIterable<TokenChunk> {
  for (const chunk of chunks) yield chunk;
}

const ids = { userMessageId: "u-1", assistantMessageId: "a-1" };

describe("writeSse", () => {
  it("carries the persisted message ids in the open frame (COS-18)", async () => {
    const cap = fakeResponse();

    await writeSse(cap.res, tokens({ delta: "Hel" }, { delta: "lo" }, { delta: "", done: true }), ids);

    const match = cap.output().match(/event: open\ndata: (.*)\n\n/);
    if (!match) throw new Error("no open frame written");
    expect(JSON.parse(match[1])).toEqual({
      status: "pending",
      userMessageId: "u-1",
      assistantMessageId: "a-1",
    });
  });

  it("streams token deltas then a terminal done, in SSE wire format", async () => {
    const cap = fakeResponse();

    await writeSse(cap.res, tokens({ delta: "Hel" }, { delta: "lo" }, { delta: "", done: true }), ids);
    const out = cap.output();

    expect(cap.headers["Content-Type"]).toBe("text/event-stream");
    // token deltas are unnamed frames, each terminated by a blank line
    expect(out).toContain('data: {"delta":"Hel"}\n\n');
    expect(out).toContain('data: {"delta":"lo"}\n\n');
    // the terminal token chunk (done:true) is swallowed — no empty delta frame
    expect(out).not.toContain('data: {"delta":""}');
    // clean end
    expect(out).toContain('event: done\ndata: {"status":"complete"}\n\n');
    expect(cap.ended()).toBe(true);
  });

  it("emits an error frame if the stream throws mid-way", async () => {
    const cap = fakeResponse();
    async function* boom(): AsyncIterable<TokenChunk> {
      yield { delta: "partial" };
      throw new Error("provider exploded");
    }

    await writeSse(cap.res, boom(), ids);
    const out = cap.output();

    expect(out).toContain('data: {"delta":"partial"}\n\n');
    const match = out.match(/event: error\ndata: (.*)\n\n/);
    if (!match) throw new Error("no error frame written");
    expect(JSON.parse(match[1])).toEqual({ status: "error", message: "provider exploded" });
    expect(cap.ended()).toBe(true);
  });
});
