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
- Sends events (`UPDATE_TITLE`, `CAST_BLIND_VOTE`, `REVEAL_VOTES`, `NEXT_STORY`).
- Rate-limited to 10 events per second on the client to avoid spamming the channel during fast typing.

### 2.3 Same-Device Fallback
- For local testing or offline environments, the app connects to a native `BroadcastChannel("blindscrum_[CODE]")`.
- This lets you open three browser tabs on your computer and test voting with no internet connection required.

---

## 3. Edge Deployment (Cloudflare Pages)

The app builds for **Cloudflare Pages / Workers** via OpenNext.

### 3.1 Wrangler Settings (`apps/web/wrangler.toml`)
- Compatibility date: `2024-09-23`
- Flag: `nodejs_compat`
- Entry point: `.open-next/worker.js`
- Static assets directory: `.open-next/assets`

### 3.2 Build Command
```bash
# Build edge assets
pnpm --filter web run pages:build

# Deploy with wrangler
pnpm --filter web run pages:deploy
```

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
