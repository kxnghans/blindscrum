# Security & Privacy Review: BlindScrum

This document covers threat models, input sanitization, and data privacy safeguards in BlindScrum.

---

## 1. Summary

BlindScrum has a simple security model because it has no database. It does not store user passwords, emails, ticket names, or voting histories. State exists only in browser memory and temporary WebRTC DataChannels while people are in the room.

---

## 2. Threat Analysis

### 2.1 Inspecting Network Frames (Anchoring Bias)

- **Risk:** An engineer opens browser DevTools to inspect WebRTC DataChannel frames and see how colleagues voted before casting their own vote.
- **Defense:** During the voting round, the client only sends:
  ```json
  {
    "type": "CAST_BLIND_VOTE",
    "payload": { "participantId": "user_xyz", "hasVoted": true }
  }
  ```
  The actual point number stays in local JavaScript memory until the host clicks reveal. Inspecting network traffic reveals nothing about the numbers chosen.

### 2.2 Cross-Site Scripting (XSS)

- **Risk:** Malicious users paste `<script>` or HTML tags into story titles or names.
- **Defense:**
  - Story titles are strictly clamped to 300 characters (`MAX_STORY_TITLE_LENGTH = 300`) with real-time UI counters and rendered via standard React JSX, which automatically escapes HTML entities.
  - Monikers are capped at 28 characters (`MAX_PERSONA_NAME_LENGTH = 28`).
  - Room codes are capped at 16 characters (`MAX_ROOM_CODE_LENGTH = 16`) and filtered via `/[^A-Z0-9-]/g`.

### 2.3 Accidental Secret Leaks

- **Risk:** Leaking database admin keys or private service role tokens in client JavaScript bundles.
- **Defense:**
  - BlindScrum uses zero secret keys and zero database tokens.
  - The application is completely serverless and peer-to-peer via WebRTC (Trystero Nostr/STUN), with no third-party accounts, credentials, or backend API keys in the client bundle.

### 2.4 Event Flooding

- **Risk:** A script spams peer connections with events to crash other players' browsers.
- **Defense:**
  - WebRTC DataChannels transmit peer-to-peer with lightweight JSON payloads. Event types and bounds are validated upon receipt, ignoring malformed payloads.
  - Reaction events (`THROW_REACTION`) are rate-limited per participant (250ms cooldown) and auto-evict from local memory after 3000ms.
  - The asynchronous backlog queue enforces an in-memory ceiling (maximum 50 items) to prevent memory exhaustion and wire congestion.

### 2.5 Microphone Privacy

- **Risk:** Leaving the microphone active and accidentally recording conversation after speaking the story title.
- **Defense:**
  - The speech recognition hook stops automatically after 2 seconds of silence.
  - Clicking anywhere outside the mic button immediately turns it off.
  - It requires explicit user permission in the browser before audio starts.

---

## 3. Privacy & Compliance

| Area                  | Status | Notes                                                                         |
| :-------------------- | :----- | :---------------------------------------------------------------------------- |
| **GDPR / CCPA**       | Exempt | No user data, IPs, or cookies are stored on disk.                             |
| **Data Retention**    | 0 days | State disappears when all users leave the room.                               |
| **External Trackers** | None   | Avatars and sound effects are generated locally without third-party requests. |
