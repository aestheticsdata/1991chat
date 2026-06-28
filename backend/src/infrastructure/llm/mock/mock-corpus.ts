import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

/**
 * Sentence pool for the mock LLM.
 *
 * Prefers a corpus of clean, standalone English sentences —
 * `assets/mock-corpus.txt`, a gitignored local artifact built once (a filtered
 * sample of Tatoeba: no dialogue/quotes, no placeholder-name spam). The
 * mock picks a handful at random per reply. When the file is absent it falls back
 * to a small built-in pool, so the mock still works out of the box. Read from
 * disk once and cached for the process lifetime.
 */

let cache: string[] | null = null;

/** The sentence pool — corpus if present, otherwise the built-in fallback. Cached. */
export function getMockSentences(corpusPath: string): string[] {
  if (!cache) {
    cache = loadCorpus(corpusPath) ?? FALLBACK_SENTENCES;
  }
  return cache;
}

function loadCorpus(corpusPath: string): string[] | null {
  try {
    const path = isAbsolute(corpusPath) ? corpusPath : resolve(process.cwd(), corpusPath);
    if (!existsSync(path)) return null;
    const sentences = readFileSync(path, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (sentences.length < 100) return null; // too small to be the real corpus — use fallback
    console.log(`[mock-llm] streaming replies from ${sentences.length} corpus sentences`);
    return sentences;
  } catch {
    return null; // unreadable → fall back rather than crash the mock
  }
}

/** Built-in fallback used when the corpus file is absent. Clean, generic, name-free. */
const FALLBACK_SENTENCES = [
  "Sure — I can help with that.",
  "That is a good question.",
  "Let me walk you through it.",
  "There are a few different ways to approach this.",
  "The simplest option is usually the best place to start.",
  "It really depends on what you are trying to achieve.",
  "Here is how I would think about it.",
  "Once the basics are working, the rest tends to fall into place.",
  "I would start small and iterate from there.",
  "That should be fairly straightforward to set up.",
  "Keep in mind there are trade-offs either way.",
  "In practice, most people end up doing it this way.",
  "Do not worry too much about the edge cases at first.",
  "You can always refine the details later.",
  "The key is to get something working end to end.",
  "Let me know if you would like me to go deeper on any part.",
  "It is worth double-checking the assumptions before you commit.",
  "I would lean toward the more explicit solution here.",
  "That pattern shows up all the time, so you are in good company.",
  "Feel free to adapt this to fit your own setup.",
  "Honestly, either choice would work fine.",
  "The important thing is to stay consistent.",
  "We can break this down into smaller steps if that helps.",
  "I think you are on the right track.",
  "Give it a try and see how it feels.",
  "There is no single right answer, but here is my take.",
  "It reads more easily when you keep the moving parts to a minimum.",
  "If something breaks, it is usually one of the usual suspects.",
];
