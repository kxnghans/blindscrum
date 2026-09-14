# Product Requirements Document (PRD): BlindScrum

---

## 1. Executive Summary & Vision

**BlindScrum** is a lightweight, ephemeral planning poker application built for modern distributed agile development teams. Existing estimation software is bloated with mandatory authentication walls, complex Jira integrations that lag during sprint ceremonies, persistent database tracking, and clunky interfaces that introduce cognitive anchoring bias. 

BlindScrum eliminates these pain points by offering instant zero-account room links, native browser speech recognition for ticket inputs, an asynchronous story queue, and true blind Fibonacci estimation with immediate consensus analytics.

---

## 2. Target Audience & Core Personas

### Persona A: The Scrum Master / Engineering Lead ("Alex")
- **Needs:** Fast room spin-up, zero participant login friction, smooth control over ticket sizing, and instant markdown summaries ready to paste directly into Jira, Linear, or GitHub issues.
- **Pain Point:** Spending 5 minutes every standup asking teammates to log into an estimation tool or reset forgotten passwords.

### Persona B: The Distributed Developer ("Jordan")
- **Needs:** Ability to click a link on Slack/Teams and immediately vote on their laptop or mobile phone without creating an account.
- **Pain Point:** Senior engineers stating their estimate out loud before others can think, anchoring the team to their number.

---

## 3. Core Problems Solved

1. **Cognitive Anchoring Bias:** When someone votes or speaks early, junior or hesitant engineers unconsciously adjust their estimate. BlindScrum hides card values until the synchronized reveal.
2. **Session Persistence Bloat:** Most tools store old rooms and user profiles indefinitely in Postgres databases. BlindScrum is 100% ephemeral—sessions live in client memory and active WebSocket channels.
3. **Typing Friction during Ceremonies:** Scrum masters juggle notes and ticket links. BlindScrum provides a browser-native voice input microphone to speak story titles naturally.
4. **Queue Disruption:** In typical planning poker apps, adding upcoming stories requires stopping the current round. BlindScrum provides an asynchronous drawer where team members can queue stories anytime.

---

## 4. Feature Specifications

### 4.1 Ephemeral Rooms & Frictionless Sharing
- **Room Code Generation:** Produces clean alphanumeric codes (e.g., `SCRUM-492` or `BLND-92`).
- **Shareable Deep Links:** Supports `/room/[code]` dynamic routing and `/?room=CODE` query parameter auto-join.
- **One-Click Clipboard Action:** Room header features a copy button with toast notification.

### 4.2 Agile Persona Generator
- **Deterministic Monikers:** Generates two-word agile personas (e.g., *Velocity Falcon*, *Agile Otter*).
- **Embedded SVG Avatars:** Vector graphics generated on-the-fly via mathematical hash with zero external CDN requests.
- **User Customization:** In-place modal dialog allows teammates to override their alias or regenerate faces.

### 4.3 Voice-Enabled Story Input
- **Microphone Capture:** Built upon the W3C Web Speech API (`SpeechRecognition`).
- **Live Interim Preview:** Transcribed speech renders in real-time in the input bar.
- **Silence Watchdog:** 2000ms silence detection auto-stops recording and commits the story title.

### 4.4 Asynchronous Story Queue
- **Async Addition:** Host or participants can queue upcoming tickets while voting is actively underway.
- **Queue Drawer UI:** Collapsible drawer displaying ordered queue with item count badge.
- **Sequential Advance:** "Next Story" pops the top queue item into the arena, clears cards, and archives the completed estimate into session history.

### 4.5 Blind Fibonacci Deck & 3D Virtual Table
- **Fibonacci Scale:** Cards for `1, 2, 3, 5, 8, 13, 20` plus special cards `?` (Unsure) and `☕` (Coffee break).
- **Network-Level Privacy:** Only `{ hasVoted: true }` tokens are broadcast during voting; numbers remain strictly on the voter's device until the reveal event.
- **3D Card Flip Table:** Renders connected participants with face-down cards and pulsating vote indicators, executing a synchronized 3D card flip on reveal.

### 4.6 Consensus Analytics & Export
- **Distribution Bar Chart:** Frequency distribution showing counts and percentages across cards.
- **Summary Cards:** Arithmetic Mean (rounded to 1 decimal), Mode (majority option with consensus percentage), and Spread (Min to Max).
- **Consensus & Divergence Alerts:** Triggers celebration confetti on >= 70% consensus; highlights high divergence when spread >= 5 points.
- **Markdown Export:** Single-click copy of a formatted markdown table for pasting into Jira or Slack.

---

## 5. Non-Functional Requirements

| Dimension | Target Specification |
| :--- | :--- |
| **Persistence** | **Zero DB storage**. All rooms and votes vanish upon participant disconnect. |
| **Real-time Latency** | WebSocket broadcast and presence updates delivered in **< 100ms**. |
| **Accessibility** | Full keyboard navigation across the card deck; ARIA attributes for screen readers; minimum 4.5:1 contrast ratio. |
| **Edge Compatibility** | 100% compatible with Cloudflare Pages/Workers edge runtime via `@opennextjs/cloudflare`. |
| **Zero External Assets** | Procedural Web Audio API sound synthesis and client-generated SVG avatars; no external image/audio CDN dependencies. |
