/** Message role / status — plain `as const` constant objects (e.g. `STATUS.ERROR`). */

export const ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

export const STATUS = {
  PENDING: "pending",
  STREAMING: "streaming",
  COMPLETE: "complete",
  ERROR: "error",
} as const;
