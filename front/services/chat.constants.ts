/** Chat SSE event kinds — plain `as const` constant object (e.g. `EVENT.OPEN`). */

export const EVENT = {
  OPEN: "open",
  DELTA: "delta",
  DONE: "done",
  ERROR: "error",
} as const;
