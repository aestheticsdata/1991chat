import { en } from "./en";

/**
 * The shape every locale must satisfy, derived from the English dictionary.
 * A future `fr.ts` typed `const fr: Dictionary = { … }` won't compile if it
 * misses or misspells a key.
 */
export type Dictionary = typeof en;

/**
 * The active dictionary. English-only for now — this is the one seam where
 * locale selection (cookie / route segment / an i18n lib) will later live, so
 * components can keep reading `text.*` unchanged.
 */
export const text: Dictionary = en;
