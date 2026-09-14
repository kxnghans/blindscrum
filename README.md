# BlindScrum 🃏

> **Ephemeral, Bias-Free Agile Planning Poker with Voice Input & Real-Time Analytics**

BlindScrum is an ultra-minimal, high-performance sprint estimation tool built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Deployed edge-ready for Cloudflare Pages/Workers, it delivers zero-persistence real-time collaboration with no saved cookies, no databases, and zero tracking bloat.

---

## ⚡ Core Capabilities

- **100% Ephemeral Rooms**: One active session per room code (`SCRUM-492` or `BLND-92`). Sessions live entirely in memory and vanish upon disconnection.
- **Frictionless Sharing & Auto-Join**: Share room links directly via clipboard or URL parameter (`?room=CODE` or `/room/[code]`).
- **Voice-Enabled Story Input**: Native browser `SpeechRecognition` engine with interim transcription, 2-second silence cutoff, and visual waveform cues.
- **Asynchronous Story Queue**: Participants and hosts can queue upcoming tickets at any point during active voting without interrupting estimation flow.
- **True Blind Voting**: Protects teams from anchoring bias by broadcasting only `{ hasVoted: true }` tokens across the wire until the host triggers the reveal.
- **Consensus Analytics**:
  - Horizontal vote distribution frequency bar chart
  - Summary metric cards for **Arithmetic Mean (Average)**, **Mode (Majority Choice)**, and **Min-Max Spread**
  - Instant **Jira / Linear / Slack Markdown Export**
- **Stealth Poker Theme**: High-contrast, tactile design system with Deep Obsidian (`#090D16`), Cyber Indigo (`#4F46E5`), and Frosted Slate, featuring both Dark and Light mode options.
- **Deterministic Persona Generator**: Automatic agile aliases (*Velocity Falcon*, *Agile Otter*) paired with self-contained SVG avatars.

---

## 🚀 Quick Start

### Prerequisites
- Node.js `>= 18`
- `pnpm >= 9`

### Development Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run Vitest test suite
pnpm test

# Typecheck and lint
pnpm check-types
pnpm lint
```

---

## 🏗 System Architecture

For in-depth architectural maps, component state transitions, and real-time synchronization flows, see [docs/architecture.md](./docs/architecture.md).

For the project roadmap and completed milestones, see [docs/checklist.md](./docs/checklist.md).
