# AGENTS.md

This file provides guidelines for AI agents working on the Shirugame codebase.

## Build/Run Commands

```bash
npm run dev          # Dev server with Socket.io (uses tsx)
npm run build        # Build for production (auto-runs prisma generate)
npm run build:socket # Build with custom Socket.io server
npm run start        # Production Next.js
npm run start:socket # Production with Socket.io
npm run lint         # ESLint
```

**Note:** No test runner configured. Add Vitest if needed. No separate `typecheck` script.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Prisma ORM
- **Auth:** Better Auth
- **State:** Zustand
- **Real-time:** Socket.io (custom server.mts)

## Code Style

### Imports
React/Next → libs → aliases (`@/*`) → relative

### Path Aliases
`@/*` → `./src/*` (components, lib, stores, hooks, types, utils)

### Conventions
- Components: PascalCase
- Hooks/Stores: camelCase with `use` prefix
- API routes: lowercase `route.ts`
- Use `type` for shapes, `interface` for extensible contracts
- Prefer `undefined` over `null` for optionals

## Error Handling

```typescript
try {
  // async operations
} catch (error) {
  console.error(error);
  return NextResponse.json({ message: "Error" }, { status: 500 });
}
```

## Prisma

- Import from `@/lib/prisma` (singleton)
- Run `npx prisma generate` after schema changes (auto-runs on install/build)
- Create migration: `npx prisma migrate dev --name <name>`

## Environment Variables

- `DATABASE_URL` - Prisma connection
- `NEXT_PUBLIC_APP_URL` - App URL
- Auth credentials (Better Auth)
