/**
 * Lifecycle of a message as it is produced.
 *  - Pending:   accepted, no token emitted yet ("thinking")
 *  - Streaming: tokens are flowing
 *  - Complete:  the stream finished cleanly
 *  - Error:     the stream aborted before completing
 *
 * User messages are always stored Complete; assistant messages walk
 * Pending → Streaming → Complete | Error.
 */
export enum MessageStatus {
  Pending = 'pending',
  Streaming = 'streaming',
  Complete = 'complete',
  Error = 'error',
}
