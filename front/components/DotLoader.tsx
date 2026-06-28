import { text } from "@i18n";

/**
 * DotLoader — the assistant's loading state: three dots fading in sequence
 * while a reply is pending, before the first streamed token. Rendered by
 * <Message> in the assistant's slot.
 *
 * The dots are an inline SVG coloured via the `text-ink-muted` token
 * (`fill="currentColor"`); the fade animation lives in globals.css
 * (`.dot-loader`) and is disabled under `prefers-reduced-motion`. The visible
 * dots are decorative (`aria-hidden`) — the polite live region announces the
 * sr-only label instead, so screen readers hear it without reading three dots.
 */
export function DotLoader() {
  return (
    <div className="text-chat py-1" role="status">
      <span className="sr-only">{text.chat.thinking}</span>
      <svg
        className="dot-loader block text-ink-muted"
        width="28"
        height="8"
        viewBox="0 0 28 8"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="4" cy="4" r="3" />
        <circle cx="14" cy="4" r="3" />
        <circle cx="24" cy="4" r="3" />
      </svg>
    </div>
  );
}
