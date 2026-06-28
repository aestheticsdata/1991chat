# 1991chat — backend (NestJS)

A small but real chat backend: **hexagonal (ports & adapters) + DDD tactical patterns**, a
**mock LLM** that streams random English over SSE (swappable for a real provider via one binding),
**SQLite** persistence on disk, and **session-based auth** (Redis-backed sessions, httpOnly cookie,
double-submit CSRF, bcrypt).

## Run it

Requires a running **Redis** for sessions (e.g. `brew services start redis`, or `redis-server`).

```bash
pnpm install
cp .env.example .env      # LLM_API_KEY and SESSION_SECRET are required
pnpm start:dev            # http://localhost:6400
```

The API runs on `6400`, the front on `6401`.

No default user is seeded — create one via the sign-up page or `POST /auth/register`. (Optionally set
`AUTH_DEFAULT_*` to seed one on first start.) The SQLite file is created at `DATABASE_PATH` (default
`./data/1991chat.db`); sessions live in Redis.

## Architecture

Dependencies point **inward**; the domain imports no framework.

```
interface/http  ──►  application            ──►  domain/ports  ◄── infrastructure (adapters)
  controllers          use-cases / services       (interfaces)      SQLite repos, Mock/Remote LLM,
  guards, SSE writer   DTOs                                          bcrypt hasher, Redis, typed config
                       ▲ depends only on ports ─────────────────────┘
```

- **domain/** — `Message`, `Conversation`, `User` entities + the ports (`ChatLlmProvider`,
  `ConversationRepository`, `UserRepository`). Pure TypeScript.
- **application/** — orchestration: `StreamChatUseCase`, `ConversationService`, `AuthService`,
  plus the `PasswordHasher` port. Knows ports only — no SQLite, HTTP, Redis, or txtgen.
- **infrastructure/** — the adapters: `Sqlite*Repository`, `MockLlmAdapter` (txtgen) /
  `RemoteLlmAdapter` (stub), `BcryptPasswordHasher`, `RedisService`, typed config.
- **interface/http/** — controllers, `SessionAuthGuard` + `CsrfGuard`, and the `sse-writer` that
  turns the port's `AsyncIterable<TokenChunk>` into a `text/event-stream`.

### Auth (session-based)

- Opaque session id in an httpOnly cookie (`1991chat.sid`); server-side session in **Redis**
  (`express-session` + `connect-redis`), one active session per user.
- **Double-submit CSRF**: a token kept in the session, returned in responses, required back in the
  `x-csrf-token` header on unsafe methods (`CsrfGuard`). `GET /auth/csrf` rotates it.
- **bcrypt** password hashing. `SessionAuthGuard` reads `req.session.userId`.
- The browser never calls this API directly — the Next BFF relays the cookie + CSRF + SSE.

### Swapping the mock for a real LLM

Set `LLM_PROVIDER=remote`, `LLM_BASE_URL`, and a real `LLM_API_KEY`, then implement the request/
response mapping in `RemoteLlmAdapter` (it's vendor-neutral — plain `fetch`, no SDK). Nothing in the
domain, application, or HTTP layers changes.

## API

Auth column: **session** = requires the `1991chat.sid` cookie; **+CSRF** = also requires the
`x-csrf-token` header (unsafe methods).

| Method | Route | Auth | Body / result |
|---|---|---|---|
| POST | `/auth/register` | – | `{ username, password }` → `{ user, csrfToken }` |
| POST | `/auth/login` | – | `{ username, password }` → `{ user, csrfToken }` (sets cookie) |
| GET  | `/auth/me` | session | → `{ user, csrfToken }` |
| GET  | `/auth/csrf` | session | → `{ csrfToken }` (rotates) |
| POST | `/auth/logout` | session +CSRF | destroys the session |
| POST | `/auth/change-password` | session +CSRF | `{ currentPassword, newPassword }` → `{ ok }` |
| GET  | `/conversations` | session | list |
| POST | `/conversations` | session +CSRF | `{ title? }` |
| GET  | `/conversations/:id` | session | returns messages |
| DELETE | `/conversations/:id` | session +CSRF | – |
| POST | `/chat/stream` | session +CSRF | `{ conversationId, content }` → SSE |

`/chat/stream` emits SSE: an `open` event, then `data: { delta }` per token, then `done`
(`{ status: 'complete' }`) or `error` (`{ status: 'error', message }`).

## Triggering the mock states by hand

The mock streams a normal reply unless a **keyword appears in the message content** — the simplest way
to build the frontend's loading / error states without a real provider. No header, no query, no restart:

| Keyword in the message | Behaviour |
|---|---|
| `/pending` | long "thinking" pause before the first token, then streams |
| `/slow` | large inter-token gap (good for stress-testing the UI) |
| `/error` | streams a random 1–2 sentence preamble, then aborts the stream with an `error` event |
| _(none)_ | normal reply |

So `POST /chat/stream` with `{ "content": "hi /error" }` streams a sentence or two then an SSE `error` event.
Timings are tunable via the `MOCK_*` env vars (`MOCK_PENDING_DELAY_MS`,
`MOCK_SLOW_TOKEN_DELAY_MS`, `MOCK_TOKEN_DELAY_MS`). The stop button works
end-to-end: closing the connection aborts the stream server-side.
