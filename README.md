# BlindScrum 🃏

> **Ephemeral, Bias-Free Agile Planning Poker with Voice Input & Real-Time Analytics**

BlindScrum is an ultra-minimal, high-performance sprint estimation tool built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Engineered edge-ready for Cloudflare Pages/Workers, it delivers zero-persistence real-time collaboration with no saved cookies, no databases, and zero tracking bloat.

---

## ⚡ Core Capabilities

- **100% Ephemeral Rooms**: Single active session per room code (`SCRUM-492` or `BLND-92`). Sessions live entirely in memory and vanish upon disconnection.
- **Frictionless Sharing & Auto-Join**: Share room links directly via clipboard or URL parameter (`?room=CODE` or `/room/[code]`).
- **Voice-Enabled Story Input**: Native browser `SpeechRecognition` engine with interim transcription, 2-second silence cutoff, and visual waveform cues.
- **Asynchronous Story Queue**: Participants and hosts can queue upcoming tickets at any point during active voting without interrupting estimation flow.
- **True Blind Voting**: Protects teams from anchoring bias by broadcasting only `{ hasVoted: true }` tokens across the wire until the host triggers the reveal.
- **Consensus Analytics**:
  - Horizontal vote distribution frequency bar chart
  - Summary metric cards for **Arithmetic Mean (Average)**, **Mode (Majority Choice)**, and **Min-Max Spread**
  - Instant **Jira / Linear / Slack Markdown Export**
- **Stealth Poker Theme**: High-contrast, tactile design system with Deep Obsidian (`#090D16`), Cyber Indigo (`#4F46E5`), and Frosted Slate, featuring both Dark and Light mode options.
- **Deterministic Persona Generator**: Automatic agile aliases (*Velocity Falcon*, *Agile Otter*) paired with self-contained SVG avatars.

---

## 🚀 Quick Start

### Prerequisites
- Node.js `>= 18`
- `pnpm >= 9`

### Development Setup
```bash
# Install dependencies across Turborepo workspace
pnpm install

# Start development server with Turbopack
pnpm dev

# Run Vitest test suite
pnpm test

# Typecheck and lint
pnpm check-types
pnpm lint

# Production build
pnpm build
```

---

## 📁 Annotated Project Structure

```text
blindscrum/
├── apps/
│   └── web/                               # Next.js 16 App Router application
│       ├── public/                        # Static web assets
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css            # Tailwind v4 theme, tokens, & 3D card utilities
│       │   │   ├── layout.tsx             # Root layout with ThemeProvider & Sonner Toaster
│       │   │   ├── page.tsx               # Landing page (Create Room, Join Code, Auto-routing)
│       │   │   └── room/
│       │   │       └── [code]/
│       │   │           └── page.tsx       # Live estimation arena page orchestrator
│       │   ├── components/
│       │   │   ├── arena/
│       │   │   │   ├── AnalyticsPanel.tsx # Distribution bar chart, summary cards, export
│       │   │   │   ├── FibonacciDeck.tsx  # 3D interactive Fibonacci cards (1-20, ?, ☕)
│       │   │   │   ├── PokerTable.tsx     # Live table, 3D flip card animations, host controls
│       │   │   │   └── StoryInputBar.tsx  # Story title input, Web Speech mic, quick queue
│       │   │   ├── queue/
│       │   │   │   └── StoryQueueDrawer.tsx # Slide-over queue drawer & session history
│       │   │   └── shared/
│       │   │       ├── RoomHeader.tsx     # Brand bar, room code pill, copy link, queue badge
│       │   │       ├── ThemeToggle.tsx    # Tactile light/dark mode switch
│       │   │       └── UserProfileModal.tsx # Moniker and avatar customization dialog
│       │   ├── hooks/
│       │   │   ├── useScrumSession.ts     # Master ephemeral state machine & websocket sync
│       │   │   └── useVoiceSearch.ts      # W3C SpeechRecognition microphone hook
│       │   ├── types/
│       │   │   ├── scrum.ts               # Core domain models, card values, broadcast events
│       │   │   └── speech.d.ts            # Strict W3C Web Speech API type definitions
│       │   └── utils/
│       │       ├── analytics.ts           # Mean, mode, consensus %, and spread calculation
│       │       ├── analytics.test.ts      # Vitest suite for analytics calculation
│       │       ├── persona.ts             # Deterministic moniker & SVG avatar generator
│       │       ├── persona.test.ts        # Vitest suite for persona generator
│       │       ├── roomCode.ts            # Room code generator, normalizer, and validator
│       │       ├── roomCode.test.ts       # Vitest suite for room code utilities
│       │       ├── soundEffects.ts        # Web Audio API procedural sound synthesis
│       │       └── supabase.ts            # Realtime client for presence and broadcast
│       ├── eslint.config.mjs              # ESLint 9 flat configuration
│       ├── next.config.ts                 # Next.js configuration
│       ├── package.json                   # Web application dependencies and scripts
│       ├── postcss.config.mjs             # Tailwind CSS PostCSS plugin configuration
│       ├── tsconfig.json                  # Strict TypeScript compiler options
│       ├── vitest.config.ts               # Vitest test runner configuration
│       └── wrangler.toml                  # Cloudflare Pages / Workers deployment manifest
├── docs/                                  # Comprehensive System Documentation
│   ├── architecture.md                    # Visual Mermaid diagrams & system topologies
│   ├── backend.md                         # Real-time infrastructure & ephemeral data strategy
│   ├── blindscrum.md                      # System blueprint, routing, and state transitions
│   ├── checklist.md                       # Execution tracker & completed milestones
│   ├── PRD.md                             # Product strategy and user intent classification
│   ├── review.md                          # Security, integrity, and safety assessment
│   ├── testing.md                         # Quality assurance and verification strategy
│   └── theme.md                           # Visual tokens, styling, and motion standards
├── .gitignore                             # Workspace Git exclusion patterns
├── GEMINI.md                              # AI operational guide and codebase conventions
├── package.json                           # Workspace root scripts and devDependencies
├── pnpm-lock.yaml                         # Deterministic package dependency lockfile
├── pnpm-workspace.yaml                    # Turborepo pnpm workspace package definitions
├── README.md                              # Technical onboarding and overview (this file)
└── turbo.json                             # Turborepo task pipeline configuration
```

---

## 📚 Technical Documentation Hub

All deep architectural and operational specifications are maintained in the `/docs` directory:

- [Architecture & Diagrams](./docs/architecture.md): Standalone Mermaid diagrams for real-time protocols and state transitions.
- [Product Strategy (PRD)](./docs/PRD.md): Product requirements, user stories, and feature definitions.
- [System Blueprint (BlindScrum)](./docs/blindscrum.md): Routing hierarchy, lifecycle orchestration, and estimation loops.
- [Real-Time & Ephemeral Backend](./docs/backend.md): WebSocket broadcast channels, presence arbitration, and zero-persistence rules.
- [Visual Design & Theme](./docs/theme.md): Stealth Poker palette, typography tokens, and motion guidelines.
- [Testing & Quality Assurance](./docs/testing.md): Vitest testing patterns, test suites, and regression guards.
- [Execution & Context Tracker](./docs/checklist.md): Historical milestone log and active to-do tracking.
- [Security & Risk Assessment](./docs/review.md): Zero-trust boundaries, input sanitization, and bias prevention.
