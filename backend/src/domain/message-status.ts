/**
 * Lifecycle of a message as it is produced.
 *  - Pending:   accepted, no token emitted yet ("thinking")
 *  - Streaming: tokens are flowing
 *  - Complete:  the stream finished cleanly
 *  - Error:     the stream aborted before completing
 *
 * User messages are always stored Complete; assistant messages walk
 * Pending → Streaming → Complete | Error.
 *
 * A const object (`as const`) + derived string-literal union — NOT a TS `enum`.
 * `MessageStatus.Pending` still reads as a named constant, and the type
 * `MessageStatus` is just the union 'pending' | 'streaming' | 'complete' | 'error'.
 */
export const MessageStatus = {
  Pending: "pending",
  Streaming: "streaming",
  Complete: "complete",
  Error: "error",
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];
