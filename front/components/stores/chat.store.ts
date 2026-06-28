import { EVENT } from "@services/chat.constants";
import { chatService } from "@services/chat.service";
import { ROLE, STATUS } from "@services/conversation.constants";
import { conversationService } from "@services/conversation.service";
import type { Message, MessageStatus } from "@services/conversation.types";
import { create } from "zustand";

/**
 * Chat store. Owns the conversation's messages and the streaming lifecycle.
 * One shared instance (Zustand is a module singleton), so every component reads
 * the same state — no provider, and none of the "two separate hook states" trap.
 *
 * Consume with a selector so a component only re-renders on the slice it uses:
 *   const messages = useChatStore((s) => s.messages);     // grows on every delta
 *   const isStreaming = useChatStore((s) => s.isStreaming);
 */
interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (prompt: string) => Promise<void>;
  stopMessage: () => void;
}

// Imperative handles, not UI state — they never drive a render, so they live
// outside the store. As module-level singletons they persist for the life of the
// page (one conversation per session, for now; a future "new / select
// conversation" flow will reset `conversationId`).
let controller: AbortController | null = null;
let conversationId: string | null = null;

// If the last message is an assistant reply still in flight (pending/streaming),
// move it to a terminal status. Used by the stop/error paths so the pending
// loader never dangles once the stream ends. No-op for anything else.
function settleTrailing(messages: Message[], status: MessageStatus): Message[] {
  const last = messages[messages.length - 1];
  if (last?.role === ROLE.ASSISTANT && (last.status === STATUS.PENDING || last.status === STATUS.STREAMING)) {
    return [...messages.slice(0, -1), { ...last, status }];
  }
  return messages;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  isStreaming: false,
  error: null,

  stopMessage: () => {
    controller?.abort();
    // Settle the in-flight bubble so a half-streamed (or never-started) reply
    // doesn't keep showing the pending loader after the user hits stop.
    set((s) => ({ isStreaming: false, error: null, messages: settleTrailing(s.messages, STATUS.COMPLETE) }));
  },

  sendMessage: async (prompt) => {
    // Ignore empty / whitespace-only sends, and trim stray leading/trailing
    // blank lines so they don't render as empty space in the user bubble.
    const content = prompt.trim();
    if (!content) return;

    controller = new AbortController();
    set({ isStreaming: true, error: null });

    // Optimistic bubbles — both shown instantly, before any network call: the
    // user's echo, plus an empty assistant bubble in `pending` status. That
    // pending bubble is what renders the typing loader, so the loader appears
    // the moment you hit send (covering the pre-`open` wait, conversation
    // creation included). Its id is provisional until the `open` frame brings
    // the persisted one.
    const assistantTempId = crypto.randomUUID();
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          role: ROLE.USER,
          content,
          status: STATUS.COMPLETE,
          createdAt: new Date().toISOString(),
        },
        {
          id: assistantTempId,
          role: ROLE.ASSISTANT,
          content: "",
          status: STATUS.PENDING,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    try {
      conversationId ??= (await conversationService.create()).id;

      for await (const ev of chatService.streamMessage({ conversationId, content }, { signal: controller.signal })) {
        if (ev.type === EVENT.OPEN) {
          // The assistant bubble already exists (created optimistically above);
          // swap its provisional id for the persisted one and adopt the status
          // the backend reports (still `pending`). The deltas below fill it.
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === assistantTempId ? { ...m, id: ev.assistantMessageId, status: ev.status } : m,
            ),
          }));
        } else if (ev.type === EVENT.DELTA) {
          // Grow the last bubble: drop it, glue the chunk on, put it back. The
          // first token also clears `pending` → `streaming`, retiring the loader.
          set((s) => {
            const last = s.messages[s.messages.length - 1];
            return {
              messages: [
                ...s.messages.slice(0, -1),
                { ...last, content: last.content + ev.delta, status: STATUS.STREAMING },
              ],
            };
          });
        } else if (ev.type === EVENT.DONE) {
          // Streaming finished — mark the bubble complete.
          set((s) => {
            const last = s.messages[s.messages.length - 1];
            return {
              messages: [...s.messages.slice(0, -1), { ...last, status: STATUS.COMPLETE }],
            };
          });
        } else if (ev.type === EVENT.ERROR) {
          set((s) => ({ error: ev.message, messages: settleTrailing(s.messages, STATUS.ERROR) }));
        }
      }
    } catch (err) {
      // Abort (stop button) rejects with AbortError — expected, not a failure;
      // `stopMessage` has already settled the bubble.
      if (err instanceof DOMException && err.name === "AbortError") return;
      set((s) => ({
        error: err instanceof Error ? err.message : "An unknown error occurred",
        messages: settleTrailing(s.messages, STATUS.ERROR),
      }));
    } finally {
      set({ isStreaming: false });
    }
  },
}));
