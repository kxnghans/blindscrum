# Backend & Ephemeral Infrastructure Strategy: BlindScrum

---

## 1. Zero-Persistence Philosophy

BlindScrum enforces a strict **Zero-Persistence** architectural model:

- **No Database Tables:** Unlike traditional estimation tools that store rooms, user accounts, and voting logs indefinitely in PostgreSQL or DynamoDB, BlindScrum persists **zero records**.
- **In-Memory Channel State:** Rooms exist exclusively in WebSocket channel memory while active. When the last participant leaves the room, the channel closes and all associated state evaporates.
- **Privacy & Compliance:** Eliminates GDPR, CCPA, and enterprise compliance exposure. Ticket titles, engineer identities, and estimation histories never touch persistent storage.

---

## 2. Real-Time Transport Infrastructure

Real-time synchronization is delivered through **Supabase Realtime** clusters utilizing WebSockets.

### 2.1 Connection Topology
```text
Client Browser <--(WSS / Secure WebSocket)--> Supabase Realtime Cluster
                                                    │
                                                    ├── Presence Channel (blindscrum:CODE)
                                                    └── Broadcast Channel (scrum_event)
```

### 2.2 Presence Subsystem
- Used exclusively for peer discovery and active participant heartbeats.
- Heartbeat frequency: Managed automatically by Supabase Realtime client protocol.
- On disconnect, the cluster emits a `presence:sync` event to all connected peers, triggering instant removal of the disconnected member from the live poker table.

### 2.3 Broadcast Subsystem
- Emits real-time state change events (`UPDATE_TITLE`, `CAST_BLIND_VOTE`, `REVEAL_VOTES`, `NEXT_STORY`).
- Rate limiting: Client configured with `eventsPerSecond: 10` to prevent event flooding or denial-of-service spamming during rapid typing.

### 2.4 Same-Device Local Fallback
- In offline environments or development setups without external network access, the system initializes a browser-native `BroadcastChannel("blindscrum_[CODE]")`.
- Allows multiple browser windows, tabs, or incognito profiles on the same device to synchronize in real-time without credentials.

---

## 3. Edge Runtime & Cloudflare Pages Deployment

BlindScrum is optimized for deployment to **Cloudflare Pages / Workers** using the OpenNext Cloudflare adapter.

### 3.1 Wrangler Configuration (`apps/web/wrangler.toml`)
- **Compatibility Date:** `2024-09-23`
- **Compatibility Flags:** `["nodejs_compat"]`
- **Worker Entry Point:** `.open-next/worker.js`
- **Static Assets Binding:** `.open-next/assets` bound to `ASSETS`

### 3.2 OpenNext Build Lifecycle
```bash
# 1. Turborepo triggers OpenNext build pipeline
pnpm --filter web run pages:build

# 2. Next.js creates standalone build in .next/
# 3. opennextjs-cloudflare bundles edge worker into .open-next/
# 4. Deploy assets to Cloudflare edge network
pnpm --filter web run pages:deploy
```

---

## 4. Security, Sanitization & Boundary Defense

1. **Blind Vote Masking:**
   - Numerical estimates are held in client memory during the `VOTING` state.
   - Payloads transmitted across the wire during voting are restricted to `{ participantId, hasVoted: true }`. Network inspection via DevTools reveals no point values until the host triggers `REVEAL_VOTES`.
2. **Input Boundary Sanitization:**
   - Story titles: Truncated to 140 characters, stripped of control characters, and escaped by React DOM.
   - User monikers: Truncated to 28 characters.
   - Room codes: Normalized to uppercase alphanumeric strings (`[A-Z0-9-]`) between 3 and 16 characters.
3. **Zero Secret Leakage:**
   - The application relies exclusively on public anonymous client keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - Service role keys or admin database secrets are strictly prohibited from client bundles.
