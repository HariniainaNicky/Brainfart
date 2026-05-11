# AGENTS.md

Project: **BrainFart** (`brainfart`, aka shirugame-trivia) — real-time multiplayer trivia game.

## Commands

```bash
npm run dev          # Dev server (tsx server.mts — custom Socket.io, NOT next dev)
npm run build        # prisma generate && next build
npm run build:socket # prisma generate && next build && tsc --project tsconfig.server.json && tsc-alias -p tsconfig.server.json
npm run start        # next start
npm run start:socket # prisma generate && node dist/server.mjs
npm run lint         # ESLint
npm run push         # git push -u origin HEAD
```

- **No test runner configured.** `test/` dirs are empty.
- **No `typecheck` script.** `tsc` is only used via `build:socket`.
- **`postinstall`** auto-runs `prisma generate`.

## Tech Stack

- Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4 + `tw-animate-css`
- Prisma ORM (PostgreSQL), Better Auth, Zustand, Socket.io
- shadcn/ui "new-york" style, zinc base, lucide icons, `class` for dark mode

## Key Quirks

- **Prisma client** is generated to `src/generated/prisma/` (custom `output` path in schema).
- Two `prisma` files exist: `src/lib/prisma.ts` and `src/lib/prisma.mts` — both export the same singleton. The `.mts` version is used by `tsconfig.server.json` for the Socket.io server bundle. Import from `@/lib/prisma`.
- **shadcn/ui components** live at `@/components/ui/shadcn-component/` (non-default alias).
- **Tailwind v4** uses `@import "tailwindcss"` in CSS (NOT old `@tailwind` directives). PostCSS plugin is `@tailwindcss/postcss`.
- **Socket.io** runs as a standalone server (`server.mts`). Dev: `tsx server.mts`. Prod Socket server: compiled `dist/server.mjs` via `build:socket`.
- **Two socket patterns coexist**: `socket-provider.tsx` (simple `createInstanceOfSocket`) and `useSocketStore.ts` (Zustand store with `NEXT_SOCKET_BASE_URL` env var).

## Conventions

- Components: PascalCase. Hooks/stores: camelCase with `use` prefix.
- API routes: lowercase `route.ts`.
- Imports: React/Next → libs → `@/*` → relative.
- Use `type` for shapes, `interface` for extensible contracts. Prefer `undefined` over `null`.

## Commit

Conventional commits via Commitizen (`cz_conventional_commits`). Pre-commit hook enforces commitizen; pre-push hook validates branch commits.

## Auth

Better Auth with email/password, GitHub, Google OAuth, username plugin, admin plugin, email verification, 30-day sessions.

```typescript
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client"; // client side
```

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | |
| `BETTER_AUTH_URL` | Yes | |
| `NEXT_PUBLIC_APP_URL` | Yes | |
| `NEXT_SOCKET_BASE_URL` | Yes | Used in `useSocketStore` — not in `.env.example`! |
| `GITHUB_CLIENT_ID/SECRET` | Optional | Social login |
| `GOOGLE_CLIENT_ID/SECRET` | Optional | Social login |
| `NODEMAILER_USER/APP_PASSWORD` | Optional | Email verification |

## Local Skills

The repo bundles `.opencode/skills/ui-ux-pro-max/` — available for UI/UX guidance.
