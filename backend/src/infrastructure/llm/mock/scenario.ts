/**
 * Mock behaviour selector. Lives in infrastructure — the domain and application
 * layers never reference it.
 *  - normal:       stream tokens at the normal pace
 *  - pending:      long "thinking" delay before the first token, then stream
 *  - stream-error: emit a few tokens, then abort the stream with an error
 *  - slow:         large inter-token gap (good for stress-testing the UI)
 */
export type Scenario = 'normal' | 'pending' | 'stream-error' | 'slow';

export const SCENARIOS: readonly Scenario[] = ['normal', 'pending', 'stream-error', 'slow'];

export function parseScenario(value: unknown, fallback: Scenario = 'normal'): Scenario {
  return typeof value === 'string' && (SCENARIOS as readonly string[]).includes(value)
    ? (value as Scenario)
    : fallback;
}
