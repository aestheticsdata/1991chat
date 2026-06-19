// Prompt — the composer. The layout (textarea + play/stop button) is provided;
// the behaviour is yours.
// TODO (you): controlled textarea state, then submit with the CSRF-aware helper:
//   import { apiFetch } from '@lib/api';
//   const res = await apiFetch('/chat', { method: 'POST',
//     body: JSON.stringify({ conversationId, content }) });
//   const reader = res.body!.getReader(); // consume the SSE token stream
// Pass an AbortController signal to apiFetch's init to wire the stop button;
// swap the play icon for a stop icon while streaming.
import { text } from "@i18n";

export function Prompt() {
  return (
    <form className="mx-auto flex w-full max-w-3xl items-end gap-2 p-4">
      <textarea
        rows={1}
        placeholder={text.chat.composerPlaceholder}
        className="max-h-48 min-h-[44px] flex-1 resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 outline-hidden focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
      />

      {/* Play ▶ when idle; swap to Stop ■ while streaming. */}
      <button
        type="submit"
        aria-label={text.chat.send}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-neutral-900 text-white transition hover:bg-neutral-700 disabled:opacity-40"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </form>
  );
}
