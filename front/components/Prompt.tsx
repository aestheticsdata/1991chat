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
import { text } from "@i18n";

export function Prompt() {
  return (
    <form className="mx-auto flex w-full max-w-3xl items-end gap-2 p-4">
      <textarea
        rows={1}
        placeholder={text.chat.composerPlaceholder}
        className="max-h-48 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-elevated px-4 py-2.5 text-ink outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/30"
      />

      {/* Play ▶ when idle; swap to Stop ■ while streaming. */}
      <button
        type="submit"
        aria-label={text.chat.send}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent transition hover:bg-accent-strong disabled:opacity-40 cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </form>
  );
}
