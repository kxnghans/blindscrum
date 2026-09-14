# Security & Privacy Review: BlindScrum

This document covers threat models, input sanitization, and data privacy safeguards in BlindScrum.

---

## 1. Summary

BlindScrum has a simple security model because it has no database. It does not store user passwords, emails, ticket names, or voting histories. State exists only in browser memory and temporary WebSocket channels while people are in the room.

---

## 2. Threat Analysis

### 2.1 Inspecting Network Frames (Anchoring Bias)
- **Risk:** An engineer opens browser DevTools to read WebSocket messages and see how colleagues voted before casting their own vote.
- **Defense:** During the voting round, the client only sends:
  ```json
  { "type": "CAST_BLIND_VOTE", "payload": { "participantId": "user_xyz", "hasVoted": true } }
  ```
  The actual point number stays in local JavaScript memory until the host clicks reveal. Inspecting network traffic reveals nothing about the numbers chosen.

### 2.2 Cross-Site Scripting (XSS)
- **Risk:** Malicious users paste `<script>` or HTML tags into story titles or names.
- **Defense:**
  - Story titles are limited to 140 characters and rendered via standard React JSX, which automatically escapes HTML entities.
  - Monikers are capped at 28 characters.
  - Room codes are filtered with `[^A-Z0-9-]`.

### 2.3 Accidental Secret Leaks
- **Risk:** Leaking database admin keys or private service role tokens in client JavaScript bundles.
- **Defense:**
  - The client only uses the public anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - There are no database tables, so even with this key, an attacker cannot read or write table data.

### 2.4 Event Flooding
- **Risk:** A script spams the WebSocket connection with events to crash other players' browsers.
- **Defense:**
  - The Supabase client throttles outgoing events to 10 events per second.

### 2.5 Microphone Privacy
- **Risk:** Leaving the microphone active and accidentally recording conversation after speaking the story title.
- **Defense:**
  - The speech recognition hook stops automatically after 2 seconds of silence.
  - Clicking anywhere outside the mic button immediately turns it off.
  - It requires explicit user permission in the browser before audio starts.

---

## 3. Privacy & Compliance

| Area | Status | Notes |
| :--- | :--- | :--- |
| **GDPR / CCPA** | Exempt | No user data, IPs, or cookies are stored on disk. |
| **Data Retention** | 0 days | State disappears when all users leave the room. |
| **External Trackers** | None | Avatars and sound effects are generated locally without third-party requests. |
