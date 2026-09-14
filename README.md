# BlindScrum

> Fast, private planning poker with speech input, zero database storage, and real-time consensus metrics.

BlindScrum is a sprint estimation tool built on Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. It deploys natively to Vercel. Nothing touches a database. When your team closes the room, the session data disappears.

---

## What It Does

- **In-Memory Rooms**: Rooms use clean alphanumeric codes (`SCRUM-492` or `BLND-92`). State stays in browser memory and WebSockets.
- **Direct Links**: Share links directly or pass a room code via URL (`?room=CODE` or `/room/[code]`).
- **Story Pipeline**: See what you are sizing right now, what is up next, and the remaining backlog horizon. Anyone on the team can queue upcoming tickets inline without opening a sidebar.
- **Voice Story Input**: Uses the browser Web Speech API. Tap the mic, read the ticket title out loud, and it writes it into the title box and stops when you pause.
- **Story Backlog Queue**: Manage, reorder, and review completed tickets in a slide-over drawer without pausing the active vote.
- **Secret Blind Voting**: Clients only broadcast `{ hasVoted: true }`. Card numbers stay on the voter's device until the host clicks reveal.
- **Numeric Fibonacci Deck**: Pure numeric cards (`1, 2, 3, 5, 8, 13, 20`) with 3D tactile states and physical flip mechanics.
- **Interactive Table Reactions**: Click another teammate's seat to throw playful real-time reactions (egg splatter, tomato burst, sleeping gas with Zzz, confetti cheers, or lightning zap) backed by procedural Web Audio sound synthesis.
- **Vote Breakdown**:
  - Horizontal bar chart of vote frequencies
  - Summary cards for average, consensus pick, and spread
  - One-click copy for Jira, Linear, and Slack markdown tables
- **Stealth Theme**: Dark mode default (`#090D16` slate) with high-contrast light mode, fully accessible with real keyboard focus rings.
- **Avatars & Presets**: Generates agile names (_Velocity Falcon_, _Agile Otter_) with deterministic inline SVG faces, plus a 10-character preset gallery and one-click randomizer.

---

## Quick Start

### Prerequisites

- Node.js 18 or newer
- pnpm 9 or newer

### Commands

```bash
# Install dependencies
pnpm install

# Start local dev server
pnpm dev

# Run Vitest suite
pnpm test

# Strict typecheck and ESLint
pnpm check-types
pnpm lint

# Production build
pnpm build

# Deploy to Vercel
pnpm deploy
```

---

## Project Structure

```text
blindscrum/
├── apps/
│   └── web/                               # Next.js 16 App Router application
│       ├── public/                        # Static assets
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css            # Tailwind v4 theme, tokens, & 3D card styles
│       │   │   ├── layout.tsx             # Root layout with ThemeProvider & Sonner Toaster
│       │   │   ├── page.tsx               # Landing page (Create Room, Join Code, Auto-routing)
│       │   │   └── room/
│       │   │       └── [code]/
│       │   │           └── page.tsx       # Live estimation arena page orchestrator
│       │   ├── components/
│       │   │   ├── arena/
│       │   │   │   ├── AnalyticsPanel.tsx # Distribution bar chart, summary cards, export
│       │   │   │   ├── FibonacciDeck.tsx  # Interactive Fibonacci cards (1, 2, 3, 5, 8, 13, 20)
│       │   │   │   ├── PokerTable.tsx     # Live table, 3D flip card animations, reactions
│       │   │   │   ├── StoryInputBar.tsx  # Story title input and Web Speech mic
│       │   │   │   └── StoryPipeline.tsx  # Unified Now Sizing, Up Next, & inline queue
│       │   │   ├── queue/
│       │   │   │   └── StoryQueueDrawer.tsx # Slide-over queue drawer & session history
│       │   │   └── shared/
│       │   │       ├── RoomHeader.tsx     # Brand bar, room code pill, copy link, queue badge
│       │   │       ├── ThemeToggle.tsx    # Light/dark mode toggle
│       │   │       └── UserProfileModal.tsx # Name, avatar presets, and randomizer dialog
│       │   ├── hooks/
│       │   │   ├── useScrumSession.ts     # Master ephemeral state machine & websocket sync
│       │   │   └── useVoiceSearch.ts      # W3C SpeechRecognition microphone hook
│       │   ├── types/
│       │   │   ├── scrum.ts               # Core domain models, card values, reaction types
│       │   │   └── speech.d.ts            # W3C Web Speech API type definitions
│       │   └── utils/
│       │       ├── analytics.ts           # Mean, mode, consensus %, and spread calculation
│       │       ├── analytics.test.ts      # Vitest suite for analytics calculation
│       │       ├── persona.ts             # Moniker, avatar presets, and SVG generator
│       │       ├── persona.test.ts        # Vitest suite for persona generator
│       │       ├── roomCode.ts            # Room code generator, normalizer, and validator
│       │       ├── roomCode.test.ts       # Vitest suite for room code utilities
│       │       ├── soundEffects.ts        # Web Audio API procedural sound synthesis
│       │       └── supabase.ts            # Realtime client for presence and broadcast
│       ├── eslint.config.mjs              # ESLint 9 configuration
│       ├── next.config.ts                 # Next.js configuration
│       ├── package.json                   # Web app dependencies and scripts
│       ├── postcss.config.mjs             # Tailwind CSS PostCSS plugin configuration
│       ├── tsconfig.json                  # TypeScript compiler options
│       └── vitest.config.ts               # Vitest test runner configuration
├── docs/                                  # Technical Documentation
│   ├── architecture.md                    # Mermaid diagrams & system topologies
│   ├── backend.md                         # Real-time infrastructure & ephemeral data strategy
│   ├── blindscrum.md                      # System blueprint, routing, and state transitions
│   ├── browser-test.md                    # Browser validation matrix & manual test runs
│   ├── checklist.md                       # Execution tracker & completed milestones
│   ├── PRD.md                             # Product requirements and user intent
│   ├── review.md                          # Security, integrity, and safety assessment
│   ├── testing.md                         # Quality assurance and verification strategy
│   └── theme.md                           # Visual tokens, styling, and motion standards
├── .gitignore                             # Git exclusions
├── GEMINI.md                              # AI operational guide and codebase conventions
├── package.json                           # Workspace root scripts and devDependencies
├── pnpm-lock.yaml                         # Package lockfile
├── pnpm-workspace.yaml                    # Workspace packages
├── README.md                              # Project overview (this file)
└── turbo.json                             # Turborepo task pipeline configuration
```

---

## Documentation

Detailed technical references live in `/docs`:

- [Architecture & Diagrams](./docs/architecture.md): Mermaid flows for real-time protocols, state transitions, and reaction pipelines.
- [Product Requirements (PRD)](./docs/PRD.md): Problem breakdown, personas, and feature specs.
- [System Blueprint](./docs/blindscrum.md): Routing, lifecycle, voice input, and estimation loops.
- [Real-Time & Ephemeral Backend](./docs/backend.md): WebSocket channels, presence, Vercel deployment, and zero-persistence rules.
- [Visual Design & Theme](./docs/theme.md): Color tokens, typography, and 3D card transitions.
- [Testing & Quality Assurance](./docs/testing.md): Vitest suites, concurrency scenarios, and verification steps.
- [Browser Test Matrix](./docs/browser-test.md): Multi-iteration desktop, mobile, theme, and peer sync test log.
- [Execution Tracker](./docs/checklist.md): Completed milestones and current status.
- [Security & Risk Assessment](./docs/review.md): Data boundaries, sanitization, and bias prevention.
