# BlindScrum: AI Operating Instructions & System Conventions

## Project Overview

**BlindScrum** is an ultra-minimal, high-performance, ephemeral planning poker application built for agile engineering teams. It eliminates cognitive anchoring bias through masked real-time voting, provides browser-native voice story input, offers an asynchronous story queue, and renders instant consensus analytics with zero database persistence.

---

## 🛠 Tech Stack

- **Monorepo:** Turborepo (`turbo`), `pnpm` workspace (`apps/*`)
- **Web Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript (Strict mode, `"Any is the Enemy"`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), CSS Custom Properties
- **State & Realtime:** Ephemeral Supabase Realtime Broadcast & Presence + local `BroadcastChannel` failover
- **Speech Engine:** Native browser W3C `SpeechRecognition` / `webkitSpeechRecognition`
- **Testing:** Vitest
- **Deployment:** Cloudflare Pages/Workers (via OpenNext `@opennextjs/cloudflare` & `wrangler`)

---

## 🧱 Core Engineering Principles

1. **YAGNI & KISS:** Build only what is immediately needed. Strictly avoid over-engineering, unnecessary database migrations, or bloated abstractions.
2. **Zero Persistence (Ephemeral Rule):** Sessions must live exclusively in memory and active WebSocket channels. Do not create persistent Postgres tables, session cookies, or backend storage for room state.
3. **True Blind Voting Integrity:** During the `VOTING` state, clients must transmit only masked status packets (`{ hasVoted: true }`). Numerical card values must remain isolated on client memory until the host emits the `REVEAL_VOTES` event.
4. **Separation of Concerns:** Keep UI components dumb and modular. State orchestration is encapsulated in domain hooks (`useScrumSession`, `useVoiceSearch`), and calculations are pure functions (`calculateVoteAnalytics`).
5. **Type Safety ("Any is the Enemy"):** Strict TypeScript typing is enforced across all domain boundaries. Avoid `any` or verbose unsafe casting.
6. **Code Commenting Standards:** Add concise, production-grade comments per logical block (~every 10–15 lines) explaining intent and rationale rather than restating the syntax.

---

## 📋 Directory Organization

- `apps/web`: Next.js 16 web application.
  - `src/app`: App Router pages (`/` landing, `/room/[code]` arena) and `globals.css`.
  - `src/components/arena`: Sizing arena components (StoryInputBar, FibonacciDeck, PokerTable, AnalyticsPanel).
  - `src/components/queue`: Asynchronous story queue slide-over drawer.
  - `src/components/shared`: Header, theme toggle, and profile customization modal.
  - `src/hooks`: Real-time state orchestration and speech recognition hooks.
  - `src/types`: Domain models (`scrum.ts`) and W3C Web Speech typings (`speech.d.ts`).
  - `src/utils`: Pure calculation engines, persona generator, procedural sound synth, and Supabase client.
- `docs/`: Centralized single-source-of-truth technical documentation.

---

## ⚡ Key Commands

Run all commands from the **workspace root**:

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts local Next.js dev server (`next dev --turbo`). |
| `pnpm build` | Executes production Next.js build (`next build`). |
| `pnpm test` | Runs Vitest unit and integration test suite. |
| `pnpm check-types` | Executes strict TypeScript check (`tsc --noEmit`). |
| `pnpm lint` | Runs ESLint 9 across all packages. |
| `pnpm pages:build` | Compiles edge worker via OpenNext Cloudflare. |
| `pnpm format` | Formats codebase with Prettier. |

---

## 🔒 Operational Constraints for AI Agents

- **Command Syntax:** Stack terminal commands using `;` (never `&&` on Windows PowerShell).
- **Non-Destructive Documentation:** When modifying or syncing docs in `/docs/`, refine currency without stripping historical detail or completed milestones.
- **Verification Mandate:** Never conclude a task without verifying code health via `pnpm check-types`, `pnpm lint`, and `pnpm test`.
