/** The header a Server Action call carries its id in. */
const ACTION_HEADER = "next-action";

/**
 * Whether a request is trying to invoke a Server Action (CHT-16).
 *
 * This app has no Server Actions, so any request carrying a `Next-Action` header is unwanted —
 * a scanner probing the endpoint, or a stale tab from before. Left to reach Next, each one logs
 * an error with a stack (several rows in Iknos per probe, an alert after a few dozen). A well-formed
 * id is no exception: it can match no action here either, so Next logs it just the same. Turned away
 * in the proxy with a bare 400, they all leave nothing behind.
 */
export const isServerActionRequest = (headers: Headers): boolean => headers.has(ACTION_HEADER);
