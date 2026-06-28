/**
 * Mock behaviour selector. Lives in infrastructure — the domain and application
 * layers never reference it.
 *  - normal:       stream tokens at the normal pace
 *  - pending:      long "thinking" delay before the first token, then stream
 *  - stream-error: stream a random 1–2 sentence preamble, then abort with an error
 *  - slow:         large inter-token gap (good for stress-testing the UI)
 */
export type Scenario = "normal" | "pending" | "stream-error" | "slow";

/**
 * Dev convenience: trigger a scenario straight from the chat box by dropping a
 * keyword anywhere in the message (e.g. "/error"). Returns undefined when none
 * is present, so the caller falls back to the header / query / configured
 * default.
 */
const SCENARIO_KEYWORDS: Record<string, Scenario> = {
  "/error": "stream-error",
  "/pending": "pending",
  "/slow": "slow",
};

export function scenarioFromText(text: string): Scenario | undefined {
  const haystack = text.toLowerCase();
  for (const [keyword, scenario] of Object.entries(SCENARIO_KEYWORDS)) {
    if (haystack.includes(keyword)) return scenario;
  }
  return undefined;
}
