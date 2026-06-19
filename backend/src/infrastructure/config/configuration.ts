import { parseScenario, Scenario } from "@infrastructure/llm/mock/scenario";

/** DI token for the validated, typed application config. */
export const APP_CONFIG = Symbol("APP_CONFIG");

export type LlmProviderKind = "mock" | "remote";

export interface AppConfig {
  port: number;
  corsOrigin: string;
  databasePath: string;
  llm: {
    provider: LlmProviderKind;
    apiKey: string;
    baseUrl: string;
  };
  mock: {
    defaultScenario: Scenario;
    tokenDelayMs: number;
    slowTokenDelayMs: number;
    pendingDelayMs: number;
    errorAfterTokens: number;
  };
  redis: {
    url: string;
  };
  session: {
    secret: string;
    cookieName: string;
    ttlSeconds: number;
    cookieSecure: boolean;
    redisPrefix: string;
  };
  auth: {
    defaultUsername: string | null;
    defaultPassword: string | null;
  };
}

function intFromEnv(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function boolFromEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === "true";
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (copy .env.example to .env)`);
  }
  return value;
}

/**
 * Reads process.env into a typed config and FAILS FAST on missing required
 * values (LLM_API_KEY, SESSION_SECRET). Runs as a provider factory, so a throw
 * here aborts startup. Env files are loaded by `dotenv/config` in main.ts.
 */
export function loadConfig(): AppConfig {
  const apiKey = required("LLM_API_KEY");
  const sessionSecret = required("SESSION_SECRET");
  const provider: LlmProviderKind = process.env.LLM_PROVIDER === "remote" ? "remote" : "mock";

  return {
    port: intFromEnv(process.env.PORT, 6400),
    corsOrigin: process.env.CORS_ORIGIN?.trim() || "http://localhost:6401",
    databasePath: process.env.DATABASE_PATH?.trim() || "./data/1991chat.db",
    llm: {
      provider,
      apiKey,
      baseUrl: process.env.LLM_BASE_URL?.trim() || "",
    },
    mock: {
      defaultScenario: parseScenario(process.env.MOCK_SCENARIO, "normal"),
      tokenDelayMs: intFromEnv(process.env.MOCK_TOKEN_DELAY_MS, 45),
      slowTokenDelayMs: intFromEnv(process.env.MOCK_SLOW_TOKEN_DELAY_MS, 600),
      pendingDelayMs: intFromEnv(process.env.MOCK_PENDING_DELAY_MS, 8000),
      errorAfterTokens: intFromEnv(process.env.MOCK_ERROR_AFTER_TOKENS, 4),
    },
    redis: {
      url: process.env.REDIS_URL?.trim() || "redis://localhost:6379",
    },
    session: {
      secret: sessionSecret,
      cookieName: process.env.SESSION_COOKIE_NAME?.trim() || "1991.sid",
      ttlSeconds: intFromEnv(process.env.SESSION_TTL_SECONDS, 86400),
      cookieSecure: boolFromEnv(process.env.COOKIE_SECURE, false),
      redisPrefix: process.env.SESSION_REDIS_PREFIX?.trim() || "1991:sess:",
    },
    auth: {
      defaultUsername: process.env.AUTH_DEFAULT_USERNAME?.trim() || null,
      defaultPassword: process.env.AUTH_DEFAULT_PASSWORD?.trim() || null,
    },
  };
}
