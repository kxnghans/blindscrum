# Real-Time & Ephemeral Backend Strategy: BlindScrum

This document describes how BlindScrum handles real-time sync, edge deployment, and zero-persistence state.

---

## 1. Zero Persistence

BlindScrum intentionally has no database:

- **No tables:** We do not create PostgreSQL, SQLite, or KV tables for rooms, votes, or users.
- **In-memory state:** State lives in the WebSocket connection while people are in the room. When the last person leaves, the channel closes and the data is gone.
- **No data retention concerns:** We don't store user emails, names, or sprint tickets, avoiding GDPR and data privacy compliance issues.

---

## 2. Real-Time Transport

All sync happens through **Supabase Realtime** over WebSockets, using public anonymous publishable keys.

### 2.1 Presence

- Tracks who is currently in the room.
- Heartbeats maintain active client status.
- When someone closes their tab, Supabase emits a presence change, and the table removes their seat immediately.

### 2.2 Broadcast Channels

- Sends events (`UPDATE_TITLE`, `CAST_BLIND_VOTE`, `REVEAL_VOTES`, `NEXT_STORY`, `THROW_REACTION`).
- Rate-limited to 10 events per second on the client to avoid spamming the channel during fast typing.

### 2.3 Same-Device Fallback

- For local testing or offline environments, the app connects to a native `BroadcastChannel("blindscrum_[CODE]")`.
- This lets you open three browser tabs on your computer and test voting with no internet connection required.

---

## 3. Deployment Architecture (Vercel)

BlindScrum deploys on **Vercel** with native zero-config support for Next.js 16 (App Router), React 19, and Turbopack.

### 3.1 Monorepo Build Pipeline

- **Framework Preset:** Next.js
- **Root Directory:** `.` (managed by Turborepo)
- **Build Command:** `pnpm build` (executes `turbo run build`)
- **Output Directory:** Next.js App Router default (`apps/web/.next`)
- **Node.js Runtime:** `>= 18.x`

### 3.2 Deployment Commands

```bash
# Build production bundle
pnpm build

# Deploy directly to Vercel
pnpm deploy
```

### 3.3 Ephemeral State at the Edge

Because all estimation rooms and votes live strictly in client memory and Supabase Realtime WebSocket connections, the hosting layer acts purely as an edge asset distributor and serverless HTML streamer. There are no server-side sessions, cookies, or stateful nodes to manage.

---

## 4. Security & Sanitization

1. **Vote Masking:**
   - During voting, clients only broadcast `{ participantId, hasVoted: true }`.
   - The selected point number stays in the voter's browser until the host clicks reveal. Inspecting WebSocket traffic in DevTools will not leak other people's estimates.
2. **Input Bounds:**
   - Story titles are capped at 140 characters.
   - Monikers are capped at 28 characters.
   - Room codes are filtered to alphanumeric and hyphens (`[A-Z0-9-]`).
3. **No Secret Keys:**
   - The client only uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - There are no service role keys or database credentials anywhere in the repository.
