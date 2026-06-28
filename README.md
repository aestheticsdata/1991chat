# 1991chat

AI chat app built as a System Design exercise — a mock-LLM chat with token streaming, persistence, and
auth. Two apps in one repo:

- **[`backend/`](backend/)** — NestJS (hexagonal + DDD tactical patterns): a **mock LLM** that streams
  random English over **SSE** (swappable for a real provider via one binding), **SQLite** persistence,
  and **Redis-backed session auth** with double-submit CSRF (bcrypt). See [backend/README.md](backend/README.md).
- **[`front/`](front/)** — Next.js (App Router): the app shell/layout, a BFF that proxies to the backend
  (relaying the session cookie + CSRF + SSE), the auth wiring, and the chat UI (built by hand).

## Architecture

**Backend — hexagonal (ports & adapters), dependencies point inward:**

- **`domain/`** — entities (`User`, `Conversation`, `Message`) + ports (`ChatLlmProvider`,
  `ConversationRepository`, `UserRepository`). Pure TypeScript, no framework.
- **`application/`** — use-cases / services (`StreamChatUseCase`, `ConversationService`, `AuthService`)
  and DTOs. Depends on the ports only.
- **`infrastructure/`** — the adapters that implement those ports: SQLite repos, Mock / Remote LLM,
  bcrypt hasher, Redis sessions, typed config. Each is a Nest module.
- **`interface/http/`** — controllers, the session + CSRF guards, and the SSE writer.

Full diagram + API table in [backend/README.md](backend/README.md).

**Front — Next.js App Router + BFF:**

- **`app/`** — routes. `(content)/` is the authed app (chat, about, change-password); `login/` + `signup/`
  stand alone; `api/*` are the **BFF** proxy routes (thin pass-throughs to NestJS). Theme tokens in `app/colors.css`.
- **`components/`** — UI: chat (`ChatDisplay`, `MessageList`, `Message`, `Prompt`), the `shell/`
  (sidebar, headers) and `stores/` (Zustand).
- **`services/`** — client data layer over native `fetch`: per-domain services (`auth`, `chat`,
  `conversation`) + `http/` (CSRF, auth-redirect, SSE reader). Chat streams via `fetch` + `getReader`.
- **`lib/`** — `backend.ts` (the BFF proxy), auth context, session helper. **`i18n/`** — all UI strings.

The browser never hits NestJS directly: **browser → Next `/api/*` (BFF) → NestJS**. This keeps the
backend off the public network and the session cookie on the front's own origin.

## Run locally

Requires **Node ≥ 24**, **pnpm 11**, and a running **Redis**.

```bash
# 1) backend — http://localhost:6400
cd backend && pnpm install && cp .env.example .env && pnpm start:dev

# 2) frontend — http://localhost:6401
cd front && pnpm install && cp .env.local.example .env.local && pnpm dev
```

Open <http://localhost:6401> and create an account on the sign-up page (no default user is seeded).

## Testing frontend states (mock scenarios)

The mock LLM streams a normal reply unless a **keyword appears anywhere in your chat message** — a quick
way to drive the frontend's loading / error states without a real provider:

| Keyword | What the mock does | Lets you test |
|---|---|---|
| `/pending` | long pause before the first token | the "thinking" / pending state |
| `/slow` | large gap between each token | the streaming / typing UI |
| `/error` | a few tokens, then the stream errors out | your error handling |
| _(none)_ | normal reply | the happy path |

Example: sending `hello /error` streams a few tokens then emits an SSE `error` event. Timings and the
error threshold are tunable via the `MOCK_*` vars in `backend/.env`.

## Stack

NestJS 11 · Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 · Zustand 5 · SQLite (better-sqlite3) ·
Redis (express-session) · Vitest 4 · Biome 2.5 · Node 24 · pnpm 11

The API runs on port `6400`, the front on `6401`.
