# Real-Time & Ephemeral Architecture: BlindScrum

This document describes how BlindScrum handles real-time sync, edge deployment, and zero-persistence state via WebRTC Peer-to-Peer (P2P).

---

## 1. Zero Persistence & Zero Backend

BlindScrum intentionally has no database and requires no dedicated backend server:

- **No tables or databases:** We do not create PostgreSQL, SQLite, or KV tables for rooms, votes, or users.
- **In-memory peer state:** State lives strictly in the browser memory and active WebRTC DataChannels while people are in the room. When the last person leaves, the session ceases to exist.
- **No data retention concerns:** We don't store user emails, names, or sprint tickets, avoiding GDPR and data privacy compliance issues.
- **No external account dependency:** Room connections use open WebRTC protocols with public Nostr relay signaling and STUN, requiring zero API keys.

---

## 2. Real-Time Transport (WebRTC P2P)

All multi-client real-time synchronization happens directly peer-to-peer using **WebRTC DataChannels** orchestrated via **Trystero** (with public Nostr relay signaling and free STUN servers).

### 2.1 WebRTC Peer Discovery & Presence

- When a user enters `/room/[CODE]`, the client initializes a scoped P2P room (`blindscrum-[roomCode]`).
- Clients discover peers via public Nostr signaling relays and establish direct, low-latency, encrypted WebRTC DataChannel connections.
- Peer join events prompt mutual exchange of user profiles (`ScrumUser`) and initial room state sync (`SYNC_REQUEST` / `SYNC_RESPONSE`).
- Peer leave events immediately evict the disconnected seat from the table. If the host leaves, host controls gracefully hand off to the participant with the earliest `joinedAt` timestamp.

### 2.2 P2P Action Channels

- High-frequency events (`UPDATE_TITLE`, `CAST_BLIND_VOTE`, `REVEAL_VOTES`, `NEXT_STORY`, `THROW_REACTION`, `ADD_QUEUE_ITEM`, `REMOVE_QUEUE_ITEM`, `REORDER_QUEUE`) stream directly over WebRTC DataChannels.
- Event payloads are strongly typed and serialized as JSON strings to maintain protocol integrity across browser runtimes.

### 2.3 Same-Device Offline Fallback

- For local testing or offline environments on a single machine, the app runs an automatic native `BroadcastChannel("blindscrum_[CODE]")` alongside P2P.
- Multiple browser tabs on the same laptop can estimate and vote offline even with no active internet connection.

---

## 3. Deployment Architecture (Vercel)

BlindScrum deploys on **Vercel** with native zero-config support for Next.js 16 (App Router), React 19, and Turbopack.

### 3.1 Monorepo Build Pipeline

- **Framework Preset:** Next.js
- **Root Directory:** `.` (managed by Turborepo)
- **Build Command:** `pnpm build` (executes `turbo run build`)
- **Output Directory:** Next.js App Router default (`apps/web/.next`)
- **Node.js Runtime:** `>= 18.x`
- **Branch Watch Filter (`vercel.json`):** Configured to only watch and trigger automated deployments on pushes to `origin/main`. Non-main branches (feature, chore, qa) are skipped via `git.deploymentEnabled: { "main": true, "*": false }` and `ignoreCommand`.

### 3.2 Deployment Commands

```bash
# Build production bundle
pnpm build

# Deploy directly to Vercel
pnpm deploy
```

### 3.3 Static Edge Distribution

Because all estimation rooms, queue buffers, and votes live strictly in client memory and direct browser-to-browser WebRTC DataChannels, the Vercel hosting layer acts purely as an edge asset distributor and serverless HTML streamer. There are zero stateful server nodes, no server-side sessions, and no third-party database bills.

---

## 4. Security & Sanitization

1. **Vote Masking:**
   - During voting, clients only broadcast `{ participantId, hasVoted: true }`.
   - The selected point number stays in the voter's browser memory until the host triggers a reveal. Inspecting WebRTC packet logs will not leak estimates before the reveal.
2. **Input Bounds:**
   - Story titles are capped at 300 characters (`MAX_STORY_TITLE_LENGTH = 300`).
   - Monikers are capped at 28 characters (`MAX_PERSONA_NAME_LENGTH = 28`).
   - Room codes are capped at 16 characters (`MAX_ROOM_CODE_LENGTH = 16`) and filtered to alphanumeric characters and hyphens (`[A-Z0-9-]`).
3. **Zero Secret Keys:**
   - There are no database credentials, service role keys, or API tokens anywhere in the repository.
   - The application runs 100% autonomously in the browser with no third-party vendor lock-in.
