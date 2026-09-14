# System Blueprint: BlindScrum

This document explains the routing, component layout, and real-time event pipeline of BlindScrum.

---

## 1. Workspace Layout

BlindScrum is a Turborepo monorepo with a single web package:

- **Root (`/`):** Workspace scripts, Turborepo pipeline (`turbo.json`), and pnpm workspace config.
- **`apps/web`:** Next.js 16 App Router application with React 19, TypeScript, and Tailwind CSS v4.

---

## 2. Routes & Navigation

### 2.1 Landing Route (`apps/web/src/app/page.tsx`)
- **Start or Join:** Generates an alphanumeric room code (e.g. `SCRUM-492`) or accepts an existing code.
- **Link Query Handling:** Uses Next.js `useSearchParams()` inside `<Suspense>` to check for `?room=CODE` or `?code=CODE`. If valid, it redirects straight into the room.
- **Profile Setup:** Generates a default name and avatar on load. The user can change both before entering.

### 2.2 Room Route (`apps/web/src/app/room/[code]/page.tsx`)
- **Dynamic Param:** Resolves `params.code` with React 19 `use()`.
- **Session Init:** Connects to the room channel via `useScrumSession`.
- **Arena Layout:** Places the story bar and poker table in view, with the card deck along the bottom and the analytics panel below the table when revealed.

---

## 3. Real-Time Events

The app syncs via Supabase Realtime WebSocket channels (`blindscrum:[roomCode]`). It also creates a local `BroadcastChannel` so multiple tabs on the same laptop can test without internet access.

### 3.1 Presence
- Presence tracks connected participants and heartbeat status.
- Keyed by `currentUser.id`.
- The participant with the earliest `joinedAt` timestamp acts as the host. If that tab closes, the next oldest participant takes over host controls.

### 3.2 Broadcast Events

All clients listen on the `scrum_event` topic:

| Event | Data Sent | When It Triggers |
| :--- | :--- | :--- |
| `UPDATE_TITLE` | `{ title }` | Host edits or speaks a new story title. |
| `CAST_BLIND_VOTE` | `{ participantId, hasVoted: true }` | Participant picks a card. Number stays hidden. |
| `REVEAL_VOTES` | `{ votes }` | Host reveals the table. Sends all vote values. |
| `RESET_ROUND` | `{ storyTitle? }` | Host starts a revote. Clears cards. |
| `ADD_QUEUE_ITEM` | `{ item }` | Anyone adds a story to the queue drawer. |
| `REMOVE_QUEUE_ITEM`| `{ id }` | A story is removed from the queue. |
| `REORDER_QUEUE` | `{ queue }` | An item is moved up in the queue list. |
| `NEXT_STORY` | `{ nextStory, archivedEstimate }` | Host advances to the next queued item. |

---

## 4. Voice Input (`apps/web/src/hooks/useVoiceSearch.ts`)

Adapted from `kxnghans.github.io`:

1. Binds `window.SpeechRecognition || window.webkitSpeechRecognition`.
2. Sets `continuous = true` and `interimResults = true`.
3. Streams interim words directly into the story input field while showing a red pulsating indicator.
4. Shuts off automatically after 2 seconds of silence.
5. If microphone permission is denied, it notifies the user with a Sonner toast instead of crashing.

---

## 5. Analytics (`apps/web/src/utils/analytics.ts`)

Runs pure math calculations when the host reveals cards:

- **Average:** Arithmetic mean of numeric votes (`1, 2, 3, 5, 8, 13, 20`), rounded to one decimal. Ignores `?` and coffee cards.
- **Mode & Consensus:** Finds the most common vote. If 70% or more of the team agreed (with at least 2 voters), it fires celebratory confetti.
- **Spread:** Highest vote minus lowest vote. If the difference is 5 or more points, it shows a warning banner to discuss the gap.
- **Distribution:** Prepares a list of card counts for the horizontal bar chart.

---

## 6. Procedural Sound (`apps/web/src/utils/soundEffects.ts`)

No audio files are downloaded. The app synthesizes audio in the browser via `AudioContext`:

- `playCardSelectSound()`: 440Hz to 660Hz sine blip (80ms).
- `playRevealSound()`: 4-note triangle chime (C5, E5, G5, C6).
- `playConsensusSound()`: 4-note chord on team agreement.
