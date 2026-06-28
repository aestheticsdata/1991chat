// ChatDisplay — the scrollable conversation area. Sticks to the bottom while the
// assistant streams, but lets go the moment you scroll up to read; a "jump to
// latest" button re-engages.
"use client";

import { MessageList } from "@components/MessageList";
import { useChatStore } from "@components/stores/chat.store";
import { text } from "@i18n";
import { useEffect, useRef, useState } from "react";

// Follow streamed content only while parked at the bottom. The `scroll` event
// (which fires only on real position changes) tracks whether we're pinned; a
// ResizeObserver does the actual following, so it also catches Markdown reflow
// and not just token deltas. `snapOnRise` snaps to the bottom on its rising edge
// — i.e. when a new turn starts — even if the user had scrolled away.
function useStickToBottom(snapOnRise: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true); // live flag for the observer, free of stale closures
  const [isPinned, setIsPinned] = useState(true);

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    pinnedRef.current = true;
    setIsPinned(true);
  }

  // Track whether the user is parked at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      // Within 50px of the end still counts as "at the bottom" (absorbs rounding).
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      pinnedRef.current = atBottom;
      setIsPinned(atBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // While pinned, follow any growth of the content (deltas, Markdown reflow, …).
  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) el.scrollTop = el.scrollHeight; // instant, to keep up with the stream
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // New turn → snap to the bottom (deps stay primitive so a scrolled-up reader is
  // never yanked back just because some other state re-rendered the component).
  useEffect(() => {
    if (!snapOnRise) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    pinnedRef.current = true;
    setIsPinned(true);
  }, [snapOnRise]);

  return { scrollRef, contentRef, isPinned, scrollToBottom };
}

export function ChatDisplay() {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const { scrollRef, contentRef, isPinned, scrollToBottom } = useStickToBottom(isStreaming);

  return (
    <section className="relative min-h-0 flex-1">
      <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-slim text-chat">
        <div ref={contentRef} className="mx-auto w-full max-w-5xl px-4 py-6">
          <MessageList />
        </div>
      </div>

      {!isPinned && (
        <button
          type="button"
          aria-label={text.chat.scrollToBottom}
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-4 left-1/2 grid h-9 w-9 -translate-x-1/2 cursor-pointer place-items-center rounded-full border border-line bg-elevated text-ink shadow-lg transition hover:bg-accent hover:text-on-accent"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      )}
    </section>
  );
}
