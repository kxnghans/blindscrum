# BlindScrum

> Ephemeral planning poker with voice input and real-time voting analytics.

BlindScrum is a sprint estimation tool built on Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. It runs edge-ready on Cloudflare Pages and Workers. Nothing is written to a database. When everyone leaves a room, the room is gone.

---

## What It Does

- **In-Memory Rooms**: Each room uses an alphanumeric code (`SCRUM-492` or `BLND-92`). State stays in memory and WebSockets.
- **Direct Links**: Share links directly or pass a room code via URL (`?room=CODE` or `/room/[code]`).
- **Voice Story Input**: Uses the browser Web Speech API. Click the mic, say the story title, and it types it out and stops when you pause for 2 seconds.
- **Story Backlog Queue**: Team members can queue up upcoming tickets in a slide-over drawer without pausing the active vote.
- **Secret Voting**: Clients only broadcast that they voted (`hasVoted: true`). Point numbers stay on the device until the host clicks reveal.
- **Vote Breakdown**:
  - Horizontal bar chart of vote distribution
  - Summary cards for average, consensus pick, and spread
  - One-click copy for Jira, Linear, and Slack tables
- **Stealth Theme**: Dark mode default (`#090D16` slate) and clean light mode, without past project palettes.
- **Avatars & Aliases**: Generates two-word names (*Velocity Falcon*, *Agile Otter*) with inline SVG faces. No external CDN calls.

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

# Typecheck and lint
pnpm check-types
pnpm lint

# Production build
pnpm build
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
│       │   │   │   ├── FibonacciDeck.tsx  # Interactive Fibonacci cards (1-20, ?, coffee)
│       │   │   │   ├── PokerTable.tsx     # Live table, 3D flip card animations, host controls
│       │   │   │   └── StoryInputBar.tsx  # Story title input, Web Speech mic, quick queue
│       │   │   ├── queue/
│       │   │   │   └── StoryQueueDrawer.tsx # Slide-over queue drawer & session history
│       │   │   └── shared/
│       │   │       ├── RoomHeader.tsx     # Brand bar, room code pill, copy link, queue badge
│       │   │       ├── ThemeToggle.tsx    # Light/dark mode toggle
│       │   │       └── UserProfileModal.tsx # Name and avatar customization dialog
│       │   ├── hooks/
│       │   │   ├── useScrumSession.ts     # Master ephemeral state machine & websocket sync
│       │   │   └── useVoiceSearch.ts      # W3C SpeechRecognition microphone hook
│       │   ├── types/
│       │   │   ├── scrum.ts               # Core domain models, card values, broadcast events
│       │   │   └── speech.d.ts            # W3C Web Speech API type definitions
│       │   └── utils/
│       │       ├── analytics.ts           # Mean, mode, consensus %, and spread calculation
│       │       ├── analytics.test.ts      # Vitest suite for analytics calculation
│       │       ├── persona.ts             # Moniker & SVG avatar generator
│       │       ├── persona.test.ts        # Vitest suite for persona generator
│       │       ├── roomCode.ts            # Room code generator, normalizer, and validator
│       │       ├── roomCode.test.ts       # Vitest suite for room code utilities
│       │       ├── soundEffects.ts        # Web Audio API sound synthesis
│       │       └── supabase.ts            # Realtime client for presence and broadcast
│       ├── eslint.config.mjs              # ESLint 9 configuration
│       ├── next.config.ts                 # Next.js configuration
│       ├── package.json                   # Web app dependencies and scripts
│       ├── postcss.config.mjs             # Tailwind CSS PostCSS plugin configuration
│       ├── tsconfig.json                  # TypeScript compiler options
│       ├── vitest.config.ts               # Vitest test runner configuration
│       └── wrangler.toml                  # Cloudflare Pages / Workers deployment manifest
├── docs/                                  # Technical Documentation
│   ├── architecture.md                    # Mermaid diagrams & system topologies
│   ├── backend.md                         # Real-time infrastructure & ephemeral data strategy
│   ├── blindscrum.md                      # System blueprint, routing, and state transitions
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

- [Architecture & Diagrams](./docs/architecture.md): Mermaid flows for real-time protocols and state transitions.
- [Product Requirements (PRD)](./docs/PRD.md): Problem breakdown, personas, and feature specs.
- [System Blueprint](./docs/blindscrum.md): Routing, lifecycle, and estimation loops.
- [Real-Time & Ephemeral Backend](./docs/backend.md): WebSocket channels, presence, and zero-persistence rules.
- [Visual Design & Theme](./docs/theme.md): Color tokens, typography, and card transitions.
- [Testing & Quality Assurance](./docs/testing.md): Vitest suites, test scenarios, and verification steps.
- [Execution Tracker](./docs/checklist.md): Completed milestones and current status.
- [Security & Risk Assessment](./docs/review.md): Data boundaries, sanitization, and bias prevention.
