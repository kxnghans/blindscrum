# BlindScrum: AI Operating Instructions & System Conventions

## Project Overview

BlindScrum is a planning poker tool for engineering teams. It stops people from anchoring to each other's votes by hiding picks until the reveal, lets you speak story titles over the mic, includes a backlog queue, and calculates consensus stats with zero database storage.

---

## Tech Stack

- **Monorepo:** Turborepo (`turbo`), `pnpm` workspace (`apps/*`)
- **Web Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript (Strict mode, no `any`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), CSS custom properties
- **State & Realtime:** WebRTC DataChannels (Trystero Nostr/STUN) with local `BroadcastChannel` fallback
- **Speech Engine:** Browser W3C `SpeechRecognition` / `webkitSpeechRecognition`
- **Testing:** Vitest
- **Deployment:** Vercel (Native zero-config Next.js App Router deployment)

---

## Core Engineering Principles

1. **YAGNI & KISS:** Build only what is needed now. Do not add database tables, complex abstractions, or unneeded dependencies.
2. **Zero Persistence (Ephemeral Rule):** Sessions live only in browser memory and active WebSocket channels. Do not write room state to Postgres tables or persistent cookies.
3. **True Blind Voting:** During the `VOTING` state, clients send only `{ hasVoted: true }`. Card numbers stay on the voter's device until the host clicks `REVEAL_VOTES`.
4. **Separation of Concerns:** Keep UI components focused on layout. State orchestration belongs in hooks (`useScrumSession`, `useVoiceSearch`), and calculations belong in pure functions (`calculateVoteAnalytics`).
5. **Type Safety:** Strict TypeScript everywhere. No `any` or loose casts.
6. **Code Comments:** Add short comments per logical block (~every 10-15 lines) explaining intent rather than repeating what the code literally says.

---

## Directory Organization

- `apps/web`: Next.js 16 web application.
  - `src/app`: App Router pages (`/` landing, `/room/[code]` arena) and `globals.css`.
  - `src/components/arena`: Sizing arena components (StoryPipeline, FibonacciDeck, PokerTable, AnalyticsPanel).
  - `src/components/queue`: Story queue slide-over drawer.
  - `src/components/shared`: Header, theme toggle, and profile modal.
  - `src/hooks`: Real-time session state and speech recognition hooks.
  - `src/types`: Domain models (`scrum.ts`) and W3C Web Speech typings (`speech.d.ts`).
  - `src/utils`: Math functions, persona generator, procedural sound synth, and WebRTC P2P session manager.
- `docs/`: Technical documentation.

---

## Key Commands

Run from the repository root:

| Command            | Action                                                |
| :----------------- | :---------------------------------------------------- |
| `pnpm dev`         | Starts local Next.js dev server (`next dev --turbo`). |
| `pnpm build`       | Production Next.js build (`next build`).              |
| `pnpm test`        | Runs Vitest test suite.                               |
| `pnpm check-types` | Strict TypeScript check (`tsc --noEmit`).             |
| `pnpm lint`        | Runs ESLint 9.                                        |
| `pnpm deploy`      | Production deployment to Vercel (`vercel --prod`).    |
| `pnpm format`      | Formats files with Prettier.                          |

---

## Operational Constraints for AI Agents

- **Command Syntax:** Stack terminal commands using `;` (never `&&` on Windows PowerShell).
- **Documentation Updates:** When updating docs in `/docs/`, keep existing technical facts intact while refining for clarity.
- **Verification:** Always verify code changes with `pnpm check-types`, `pnpm lint`, and `pnpm test` before finishing a task.
