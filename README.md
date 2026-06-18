# 1991chat

AI chat app built as a System Design exercise — a mock-LLM chat with token streaming, persistence, and
auth. Two apps in one repo:

- **[`backend/`](backend/)** — NestJS (hexagonal + DDD tactical patterns): a **mock LLM** that streams
  random English over **SSE** (swappable for a real provider via one binding), **SQLite** persistence,
  and **Redis-backed session auth** with double-submit CSRF (bcrypt). See [backend/README.md](backend/README.md).
- **[`front/`](front/)** — Next.js (App Router): the app shell/layout, a BFF that proxies to the backend
  (relaying the session cookie + CSRF + SSE), and the auth wiring. The chat UI components are intentionally
  left as stubs to build by hand.

## Run locally

Requires **Node ≥ 20.9**, **pnpm**, and a running **Redis**.

```bash
# 1) backend — http://localhost:6400
cd backend && pnpm install && cp .env.example .env && pnpm start:dev

# 2) frontend — http://localhost:6401
cd front && pnpm install && cp .env.local.example .env.local && pnpm dev
```

Open <http://localhost:6401> and sign in with the seeded dev user **`admin` / `admin`**.

## Stack

NestJS 11 · Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 · SQLite (better-sqlite3) ·
Redis (express-session) · pnpm

The API runs on port `6400`, the front on `6401`.
