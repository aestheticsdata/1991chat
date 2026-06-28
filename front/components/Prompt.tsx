// Prompt — the composer. The layout (textarea + play/stop button) is provided;
// the behaviour is yours.
// TODO (you): controlled textarea state, then submit via the chat service, which
// streams the reply over SSE (CSRF + auth handled for you):
//   import { chatService } from "@services/chat.service";
//   const controller = new AbortController();
//   for await (const ev of chatService.streamMessage(
//     { conversationId, content }, { signal: controller.signal })) {
//     if (ev.type === "delta") append(ev.delta); // also: "open" | "done" | "error"
//   }
// Call controller.abort() from the stop button; swap the play icon for a stop
// icon while streaming.
"use client";
import { useChatStore } from "@components/stores/chat.store";
import { text } from "@i18n";
import type { KeyboardEvent } from "react";
import { useState } from "react";

export function Prompt() {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopMessage = useChatStore((s) => s.stopMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const [message, setMessage] = useState<string>("");

  const send = () => {
    const content = message.trim();
    if (!content || isStreaming) return;
    sendMessage(content);
    setMessage("");
  };

  // Pattern A: Enter sends, Shift+Enter inserts a newline.
  // Skip while an IME is composing so we don't cut off mid-word.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form className="mx-auto flex w-full max-w-5xl items-end gap-2 p-4">
      <textarea
        rows={3}
        placeholder={text.chat.composerPlaceholder}
        className="max-h-48 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-elevated px-4 py-2.5 text-ink text-chat outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/30"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Play ▶ when idle; swap to Stop ■ while streaming. */}
      {isStreaming ? (
        <button
          type="button"
          aria-label={text.chat.stop}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent transition hover:bg-accent-strong disabled:opacity-40 cursor-pointer"
          onClick={() => {
            stopMessage();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          aria-label={text.chat.send}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent transition hover:bg-accent-strong disabled:opacity-40 cursor-pointer"
          onClick={send}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </form>
  );
}
