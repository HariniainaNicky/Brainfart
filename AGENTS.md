# AGENTS.md

Project: **BrainFart** (`brainfart`, aka shirugame-trivia) — real-time multiplayer trivia game.

## Commands

Use **pnpm** (Node 22+). Both `package-lock.json` and `pnpm-lock.yaml` are committed, but `pnpm-lock.yaml` is authoritative — don't use npm.

```bash
pnpm dev                 # Dev server (next dev)
pnpm build               # prisma generate && next build
pnpm start               # next start
pnpm lint                # ESLint
pnpm test                # Vitest (test/unit, test/integration)
pnpm coverage            # Vitest coverage on src/app/api/** (excl. auth)
pnpm push                # git push -u origin HEAD
pnpm tf:init|plan|apply|destroy  # Terraform for Vercel (needs VERCEL_API_TOKEN)
```

- **No `typecheck` script.** `pnpm build` (next build) is the closest full verification.
- **`postinstall`** auto-runs `prisma generate`.
- Prisma client generates to `src/generated/prisma/` (gitignored) — run `pnpm prisma generate` after a fresh clone or schema change before tests/typecheck.

## Tests (Vitest)

- `test/unit/` and `test/integration/` — node env, no DB required.
- CI (`.github/workflows/{test,coverage}.yml`) runs `pnpm install && pnpm prisma generate && pnpm test` on Node 22. Coverage thresholds (50%) are enforced only in CI.
- Single test: `pnpm vitest run test/integration/api/users/users.test.ts`

## Tech Stack

- Next.js 16 (App Router, `output: "standalone"`), TypeScript strict, Tailwind CSS v4 + `tw-animate-css`
- Prisma ORM (PostgreSQL), Better Auth, Zustand, Zod v4 for API validation
- shadcn/ui "new-york" style, zinc base, lucide icons, `class` for dark mode

## Key Quirks

- **shadcn/ui components** live at `@/components/ui/shadcn-component/` (non-default alias).
- **Tailwind v4** uses `@import "tailwindcss"` in CSS (NOT old `@tailwind` directives). PostCSS plugin is `@tailwindcss/postcss`.
- **Docker**: `docker-compose.yml` provides local Postgres + dev app.

## Conventions

- Components: PascalCase. Hooks/stores: camelCase with `use` prefix.
- API routes: lowercase `route.ts`.
- Imports: React/Next → libs → `@/*` → relative.
- Use `type` for shapes, `interface` for extensible contracts. Prefer `undefined` over `null`.

## Commit

Conventional commits via Commitizen. `.pre-commit-config.yaml` (commitizen-tools) enforces format at commit; `commitizen-branch` validates branch commits at pre-push.

## Auth

Better Auth with email/password, GitHub, Google OAuth, username plugin, admin plugin, email verification, 30-day sessions.

```typescript
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client"; // client side
```

## Environment Variables

Copy `.env.example` (`.env` / `.env*.local` are gitignored). Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`. Optional: `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `NODEMAILER_USER/APP_PASSWORD`.

## Infrastructure

- Deploy target: **Vercel**, managed via Terraform in `terraform/` (Vercel provider). Requires `VERCEL_API_TOKEN`; `terraform.tfvars`, `.terraform/`, `*.tfstate` are gitignored.
- `render.yaml` exists as an alternative deployment target.