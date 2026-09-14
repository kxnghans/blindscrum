# BlindScrum: System & Implementation Blueprint

---

## 1. System Overview & Monorepo Layout

BlindScrum is organized as a lightweight Turborepo monorepo designed for edge-optimized deployment to Cloudflare Pages.

### Package Architecture
- **Root Directory (`/`):** Workspace orchestrator managing pipelines (`turbo.json`), dependencies (`pnpm-workspace.yaml`), and unified toolchain scripts.
- **`apps/web`:** Next.js 16 App Router application utilizing React 19, TypeScript, and Tailwind CSS v4.

---

## 2. Routing Hierarchy & Lifecycle

BlindScrum provides two primary entry points:

### 2.1 Landing Page Route (`apps/web/src/app/page.tsx`)
- **Intent:** Frictionless room creation, direct room code lookup, and URL deep-link routing.
- **Deep Link Handling:** Listens for `?room=CODE` or `?code=CODE` query parameters using Next.js `useSearchParams()` wrapped in a `<Suspense>` boundary. When detected, normalizes the code and navigates directly to `/room/[code]`.
- **Persona Initialization:** Deterministically assigns a random moniker and SVG avatar upon load, storing it in `sessionStorage` under `blindscrum_user_[code]`.

### 2.2 Room Arena Route (`apps/web/src/app/room/[code]/page.tsx`)
- **Intent:** Orchestrates the live sprint estimation ceremony.
- **Parameter Resolution:** Next.js 16 dynamic route parameter (`params: Promise<{ code: string }>`) resolved using the React 19 `use()` hook.
- **State Mounting:** Initializes the `useScrumSession` state machine, binds the ephemeral WebSocket presence channel, and mounts the arena components.

---

## 3. Ephemeral Real-Time Protocol Specification

The real-time layer operates over Supabase Realtime WebSocket channels (`blindscrum:[roomCode]`) paired with a local `BroadcastChannel` for same-device multi-tab development.

### 3.1 Presence Channel Lifecycle
- **Key:** `currentUser.id` (generated once per session).
- **Tracked Payload:**
  - `id`: Unique participant identifier.
  - `name`: Active display moniker.
  - `avatar`: Inline SVG data URI.
  - `hasVoted`: Boolean flag indicating vote submission.
  - `joinedAt`: Epoch millisecond timestamp.
- **Host Arbitration:** When presence state updates, the client with the lowest `joinedAt` timestamp is automatically recognized as the room host. If the active host disconnects, the second oldest member is promoted immediately with zero state loss.

### 3.2 Broadcast Event Catalog
All peer communication occurs via the `scrum_event` topic:

| Event Type | Payload Attributes | Emitted When |
| :--- | :--- | :--- |
| `UPDATE_TITLE` | `{ title: string }` | Host edits or voice-transcribes a new story title. |
| `CAST_BLIND_VOTE` | `{ participantId: string, hasVoted: true }` | Participant selects a card. Note: numerical vote value is omitted. |
| `REVEAL_VOTES` | `{ votes: Record<string, FibonacciValue> }` | Host clicks "Reveal Votes". Contains all submitted values. |
| `RESET_ROUND` | `{ storyTitle?: string }` | Host triggers a revote or clears the active round. |
| `ADD_QUEUE_ITEM` | `{ item: StoryQueueItem }` | Any participant queues an upcoming story. |
| `REMOVE_QUEUE_ITEM`| `{ id: string }` | An item is deleted from the queue drawer. |
| `REORDER_QUEUE` | `{ queue: StoryQueueItem[] }` | Queue priority is modified via reorder controls. |
| `NEXT_STORY` | `{ nextStory: StoryQueueItem, archivedEstimate: FibonacciValue }` | Host pops the next item from the queue into the arena. |

---

## 4. Voice Recognition Subsystem (`apps/web/src/hooks/useVoiceSearch.ts`)

Adapted from `kxnghans.github.io`, this hook provides speech recognition:

1. **W3C API Binding:** Binds `window.SpeechRecognition || window.webkitSpeechRecognition`.
2. **Continuous Streaming:** Sets `continuous = true` and `interimResults = true`.
3. **Dynamic Feedback:** Emits interim transcripts immediately to the story title input field while displaying visual pulsating waveform indicators.
4. **Silence Watchdog:** Automatically halts capture after 2000ms of silence, preventing lingering open mic sessions.
5. **Permission & Error Guardrails:** Catches `no-speech`, `audio-capture`, and `not-allowed` errors, surfacing clear feedback via Sonner toast notifications.

---

## 5. Estimation Analytics Engine (`apps/web/src/utils/analytics.ts`)

Analytics calculations are pure, side-effect-free functions executed upon the `REVEAL_VOTES` event:

- **Arithmetic Mean:** Computes the average across numeric cards (`1, 2, 3, 5, 8, 13, 20`), ignoring non-numeric entries (`?`, `☕`). Results are rounded to 1 decimal place.
- **Mode & Consensus:** Identifies the card with the highest frequency count and calculates its team percentage. When consensus reaches $\ge 70\%$ with at least 2 voters, the system triggers celebratory chimes and confetti.
- **Spread & Divergence:** Calculates $\Delta = \text{Max} - \text{Min}$. When $\Delta \ge 5$, a divergence warning banner alerts the team to discuss outlier perspectives.
- **Distribution Array:** Assembles an ordered array of vote frequencies to drive the horizontal bar chart visualization.

---

## 6. Procedural Web Audio Engine (`apps/web/src/utils/soundEffects.ts`)

BlindScrum contains zero external audio files. Sound effects are synthesized on demand using the browser's native `AudioContext`:

- `playCardSelectSound()`: 440Hz $\to$ 660Hz sine sweep with fast 80ms exponential decay.
- `playRevealSound()`: Ascending 4-note triangle wave arpeggio ($C_5, E_5, G_5, C_6$).
- `playConsensusSound()`: 4-note celebratory harmonic fanfare ($A_4, C\#_5, E_5, A_5$).
