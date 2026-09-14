# BlindScrum: Execution & Context Tracker

## Summary of All Completed Milestones

- **Git Repository Setup**: Initialized local Git repository on `main` and linked to `git@github.com:kxnghans/blindscrum.git`.
- **Architecture Docs**: Wrote system architecture in [docs/architecture.md](./docs/architecture.md) covering real-time protocols, state machines, voice input, and security.
- **Turborepo & Workspace Config**: Configured `pnpm-workspace.yaml`, `package.json`, and `turbo.json` with Turborepo, ESLint 9, and Prettier pipelines.
- **Next.js & Tailwind v4 Setup**: Built `apps/web` with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4.
- **Stealth Poker Theme**: Set up dark and light mode color tokens in `globals.css` using deep obsidian (`#090D16`), indigo (`#4F46E5`), and emerald/amber indicators.
- **Component Primitives**: Built frosted surface cards, tactile buttons, and the top navigation header with a theme switch.
- **Persona Generator**: Built a generator in [apps/web/src/utils/persona.ts](../apps/web/src/utils/persona.ts) that creates two-word agile names and deterministic inline SVG avatars.
- **Room Codes & Deep Links**: Built room code generation (`SCRUM-492`), dynamic routing (`/room/[code]`), and `?room=[code]` link joining in [apps/web/src/app/page.tsx](../apps/web/src/app/page.tsx) and [apps/web/src/app/room/[code]/page.tsx](../apps/web/src/app/room/[code]/page.tsx).
- **Link Sharing**: Added a copy-link button in the header with Sonner toast feedback in [apps/web/src/components/shared/RoomHeader.tsx](../apps/web/src/components/shared/RoomHeader.tsx).
- **Real-Time Session Hook**: Built an in-memory session hook using Supabase presence and broadcast channels (with local `BroadcastChannel` fallback) in [apps/web/src/hooks/useScrumSession.ts](../apps/web/src/hooks/useScrumSession.ts).
- **Presence & Host Handoff**: Connected members show up on the table in real-time. If the host leaves, the next oldest participant takes over host controls.
- **Secret Voting**: Clients only broadcast `{ hasVoted: true }` during the vote. Card numbers stay on the device until the host clicks reveal.
- **Voice Mic Hook**: Built a speech-to-text hook with the Web Speech API, interim text preview, and 2-second silence cutoff in [apps/web/src/hooks/useVoiceSearch.ts](../apps/web/src/hooks/useVoiceSearch.ts).
- **Story Input Bar**: Built the active story bar with the mic button, waveform indicators, and quick-queue button in [apps/web/src/components/arena/StoryInputBar.tsx](../apps/web/src/components/arena/StoryInputBar.tsx).
- **Story Backlog Queue**: Added an asynchronous queue so teammates can add upcoming tickets anytime without interrupting the vote.
- **Queue Drawer**: Built a slide-over drawer to view, reorder, delete, and promote queued stories in [apps/web/src/components/queue/StoryQueueDrawer.tsx](../apps/web/src/components/queue/StoryQueueDrawer.tsx).
- **Sequential Sizing**: Added "Next Story" to pop the first queued item into the arena, clear cards, and record the previous estimate.
- **Fibonacci Card Deck**: Built interactive 3D cards for `1, 2, 3, 5, 8, 13, 20` in [apps/web/src/components/arena/FibonacciDeck.tsx](../apps/web/src/components/arena/FibonacciDeck.tsx).
- **Poker Table**: Built the table showing face-down cards while voting and 3D card flips on reveal in [apps/web/src/components/arena/PokerTable.tsx](../apps/web/src/components/arena/PokerTable.tsx).
- **Distribution Bar Chart**: Built a horizontal bar chart showing vote frequencies in [apps/web/src/components/arena/AnalyticsPanel.tsx](../apps/web/src/components/arena/AnalyticsPanel.tsx).
- **Summary Cards**: Rendered real-time metrics for average, consensus pick, and spread.
- **Markdown Export**: Added a single-click button to copy a formatted markdown table for Jira, Linear, or Slack.
- **Vitest Suite**: Added 10 unit tests across 3 files covering math, personas, and room codes with a 100% pass rate.
- **Vercel Deployment Pipeline**: Configured zero-config deployment on Vercel for Next.js 16 App Router and Turbopack.
- **Lint & Typecheck**: Verified zero TypeScript errors and zero ESLint errors across the repository.
- **Git Remote Push**: Pushed the main branch to `git@github.com:kxnghans/blindscrum.git`.
- **Technical Documentation**: Completed comprehensive documentation suite covering architecture, PRD, backend, theme, testing, browser validation, and security review.

---

## Active Roadmap: To-Do Items

- [x] **Task 1: First-Run Profile Onboarding Modal**
  - Add auto-open logic in room page when profile is unconfigured in `sessionStorage`.
  - Add prominent one-click "Randomize Alias" button with dice icon next to display name in `UserProfileModal`.
  - Add welcoming "Join Session" CTA that saves identity and sets configured flag.
- [x] **Task 2: Real-time Voter Visibility & Presence Tracking**
  - Sync `hasVoted` state into Supabase presence tracking in `useScrumSession.ts`.
  - Upgrade `PokerTable.tsx` participant avatars with live visual status rings (emerald ring + check badge for voted, amber pulse for pending).
  - Add real-time voter progress indicator and pending roster on the table.
- [x] **Task 3: In-Flow Story Pipeline & Frictionless Inline Queuing**
  - Build `StoryPipeline.tsx` unifying active story ("Now Sizing"), "Up Next" preview card, and backlog horizon.
  - Enable universal inline queue contribution for any teammate (voter or host) directly from the arena.
  - Preserve `StoryQueueDrawer` for deep queue reordering and completed story history.
- [x] **Task 4: Quality Gates, Stability Verification & Documentation**
  - Run `pnpm check-types`, `pnpm lint`, `pnpm test`, and `pnpm build`.
  - Update `docs/checklist.md`, `docs/architecture.md`, and `docs/blindscrum.md`.
- [x] **Task 5: Remove Question and Coffee Vote Cards**
  - Update `FibonacciValue` type in `apps/web/src/types/scrum.ts` to pure numeric Fibonacci values (`1, 2, 3, 5, 8, 13, 20`).
  - Update `FibonacciDeck.tsx` to render only the core Fibonacci cards without `?` and coffee break cards.
  - Update `calculateVoteAnalytics` in `apps/web/src/utils/analytics.ts` and test suite in `apps/web/src/utils/analytics.test.ts`.
  - Verify stability with `pnpm check-types`, `pnpm lint`, `pnpm test`, and `pnpm build`.
- [x] **Task 6: Curated Avatar Preset Gallery & Selection Menu**
  - Export curated `AVATAR_PRESETS` in `apps/web/src/utils/persona.ts`.
  - Add interactive avatar picker menu in `UserProfileModal.tsx` with preset grid, active highlight, and randomize button.
- [x] **Task 7: Real-Time Interactive Table Reactions ("Throwables")**
  - Define `TableReactionType`, payload, and broadcast event in `types/scrum.ts`.
  - Add reaction dispatch, ephemeral queue state, and cleanup in `useScrumSession.ts`.
  - Add procedural audio effects (splat, gas hiss, zap, cheers) in `soundEffects.ts`.
  - Add guest reaction popover and animated flight/splatter physics (egg, tomato, sleep gas, cheers, zap) in `PokerTable.tsx`.
- [x] **Task 8: Stability Verification & Documentation Update**
  - Run `pnpm check-types`, `pnpm lint`, `pnpm test`, and `pnpm build`.
  - Update `docs/checklist.md`, `docs/architecture.md`, `docs/blindscrum.md`, and `docs/browser-test.md`.
