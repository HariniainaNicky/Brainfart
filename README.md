# BrainFart

> Real-time multiplayer trivia game with AI-powered mock interviews.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://brainfart.vercel.app)

## Features

### Trivia Game
- Create and join multiplayer trivia rooms with custom settings
- Single-player mode for solo practice
- Configurable question types, counts, and timers
- Real-time score tracking and winner determination
- Global leaderboard with rank system

### AI Mock Interviews
- 26 tech roles (Backend, Frontend, DevOps, Data Science, ML, Cybersecurity, etc.)
- AI-suggested tech stacks based on role
- Streaming chat-based interview sessions
- Answer evaluation with scoring and mastery tracking
- Session history with persistent progress

### Authentication & Users
- Email/password registration with verification
- GitHub and Google OAuth
- User profiles with DiceBear avatar generation
- Notification system (in-app, mark as read, soft delete)

### Admin Panel
- User management (roles, bans with reason/expiry)
- Room management (search, deletion with owner notification)
- Question moderation (approve/reject submissions with scoring)

### UI/UX
- Dark mode with system preference detection
- shadcn/ui components (new-york style, zinc base)
- Retro pixel font headings (Pixelify Sans) with Funnel Display body
- Page transitions with Framer Motion
- Toast notifications

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Next.js | 16 | App Router, API routes, SSR |
| React | 19 | UI framework |
| TypeScript | 5 | Type safety (strict mode) |
| Tailwind CSS | 4 | Utility-first styling |
| Prisma | 6 | ORM (PostgreSQL) |
| Better Auth | 1.3 | Authentication (email, OAuth, sessions) |
| Zustand | 5 | Client state management |
| Zod | 4 | API request validation |
| Vitest | 4 | Test runner |
| ESLint | 9 | Linting |
| Vercel | — | Deployment & analytics |

**UI components:** Radix UI primitives, Lucide icons, Framer Motion, react-hook-form, sonner (toasts), typed.js

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL database (e.g., Supabase, Prisma Postgres)

### Install

```bash
git clone https://github.com/your-username/brainfart.git
cd brainfart
cp .env.example .env
# Fill in required environment variables (see below)
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` and fill in:

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for session signing |
| `BETTER_AUTH_URL` | Base URL for Better Auth |

### Optional — Social Login

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Optional — Email

| Variable | Description |
|---|---|
| `NODEMAILER_USER` | Gmail address for sending emails |
| `NODEMAILER_APP_PASSWORD` | Gmail app password |

### Optional — AI Interview

| Variable | Description |
|---|---|
| `OPENCODE_API_KEY` | API key for AI completions |
| `AI_MODEL` | Model name for AI completions |
| `AI_PROMPT_SUGGEST_STACK` | System prompt for stack suggestion |
| `AI_PROMPT_INTERVIEW_SYSTEM` | System prompt for interview conductor |
| `AI_PROMPT_EVALUATE_SYSTEM` | System prompt for answer evaluation |
| `AI_PROMPT_EVALUATE_USER` | User prompt template for evaluation |
| `AI_PROMPT_START_MESSAGE` | Initial AI message in interview |

## Project Structure

```
brainfart/
├── prisma/                  # Prisma schema (PostgreSQL)
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           #   Admin panel (users, rooms, questions)
│   │   ├── ai/              #   AI mock interview
│   │   ├── api/             #   API routes (28 endpoints)
│   │   ├── auth/            #   Sign in, sign up, onboarding
│   │   ├── leaderboard/     #   Global rankings
│   │   ├── notification/    #   In-app notifications
│   │   ├── questions/       #   Question browser & submission
│   │   ├── room/            #   Room listing, creation, detail
│   │   ├── setting/         #   User settings
│   │   ├── single-player/   #   Single-player trivia
│   │   └── user/            #   Public user profiles
│   ├── components/          # React components
│   │   ├── admin/           #   Admin slide-over sheets
│   │   ├── ui/              #   Page & feature components
│   │   └── ui/shadcn-component/  # shadcn/ui (24 components)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Auth, AI client, utilities, validation
│   ├── services/            # Database service layer
│   ├── stores/              # Zustand stores (useLogged, useUser)
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions (CRUD wrappers, helpers)
├── public/                  # Static assets
├── vitest.config.ts         # Test configuration
└── render.yaml              # Render.com deployment config
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (next dev) |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest tests |
| `pnpm coverage` | Run tests with coverage (50% threshold) |
| `pnpm push` | Push to remote (`git push -u origin HEAD`) |

## API Routes

### Users
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/users` | List users (sorted, rank > 0) |
| `GET` | `/api/users/[id]` | Get user (public or full) |
| `PATCH` | `/api/users/[id]` | Update highest score |
| `PATCH` | `/api/users/[id]/rank` | Refresh global rank |
| `PATCH` | `/api/users/[id]/image` | Update profile image |

### Questions
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/questions` | List validated questions (search, filter, random) |
| `POST` | `/api/questions` | Submit new question |
| `GET` | `/api/questions/[type]` | Random questions by type |
| `GET` | `/api/questions/randomAnswer` | 3 random answers for multiple choice |

### Rooms
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/rooms` | List rooms (filter by open/closed) |
| `POST` | `/api/rooms` | Create room |
| `GET` | `/api/rooms/[id]` | Get room details |
| `DELETE` | `/api/rooms/[id]` | Close room (determines winner) |
| `PUT` | `/api/rooms/[id]/players` | Add player |
| `PATCH` | `/api/rooms/[id]/scores` | Update score |

### AI Interview
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/ai/interview` | Suggest stack, start, chat (streaming), evaluate |
| `GET` | `/api/ai/sessions` | List interview sessions |
| `DELETE` | `/api/ai/sessions/[id]` | Delete session |

### Admin (admin role required)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/users` | Paginated user list with search/filter |
| `PATCH` | `/api/admin/users/[id]/role` | Change user role |
| `PATCH` | `/api/admin/users/[id]/ban` | Ban/unban user |
| `GET` | `/api/admin/rooms` | Paginated room list |
| `DELETE` | `/api/admin/rooms/[id]` | Delete room |
| `GET` | `/api/admin/questions/pending` | Pending question queue |
| `PATCH` | `/api/admin/questions/[id]/validate` | Approve/reject question |

## Database

Key models and relationships:

- **User** — sessions, accounts, created questions, opened/won/joined rooms, interview progress
- **Room** — opened by user, winner, players (many-to-many), questions (many-to-many), scores
- **Question** — created by user, belongs to type, shared across rooms
- **RoomPlayerScore** — tracks per-player scores per room (composite key: roomId + userId)
- **InterviewProgress** — per-user per-role interview state with mastery score
- **InterviewMessage** — chat messages for interview sessions
- **Notification** — in-app notifications with soft delete
- **Session / Account** — Better Auth managed (30-day sessions, 7-day refresh)

## Authentication

Powered by [Better Auth](https://www.better-auth.com/) with:

- **Providers:** Email/password, GitHub OAuth, Google OAuth
- **Plugins:** Username (normalized), Admin (role-based access)
- **Sessions:** 30-day expiry, 7-day refresh
- **Email verification:** Branded HTML emails via Gmail SMTP

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Set environment variables
4. Deploy — Vercel auto-detects Next.js

### Render

A `render.yaml` is included for Render.com deployment.

## Contributing

This project uses **Commitizen** with conventional commits.

```bash
# Install commitizen globally (if not already)
pnpm add -g commitizen cz-conventional-commits

# Use commitizen instead of git commit
cz commit
```

**Commit format:** `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Branch workflow:** Feature branches from `main`, push with `pnpm push` (runs `git push -u origin HEAD`).

**Pre-commit hooks** are enforced via `pre-commit-config.yaml`. **Pre-push hooks** validate branch commits.
