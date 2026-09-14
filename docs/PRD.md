# Product Requirements: BlindScrum

---

## 1. Goal

BlindScrum is a planning poker tool built for agile engineering teams. Most existing options require accounts, sync slowly with Jira during standups, store data on servers forever, and let people anchor each other by shouting or showing numbers early.

BlindScrum keeps things minimal. You open the site, send a link, read or type the ticket title, vote in private, and flip the cards together. When everyone leaves, the room state disappears.

---

## 2. Personas

### Alex (Tech Lead / Scrum Master)
- **Goal:** Run a quick 10-minute sizing session without waiting for people to create accounts or reset passwords.
- **Needs:** Fast room links, voice input so they don't have to retype tickets from Jira, and clean markdown to paste results straight into ticket descriptions.

### Jordan (Software Engineer)
- **Goal:** Vote honestly without feeling pressured by what senior engineers pick.
- **Needs:** Click a Slack link and vote on a phone or laptop with no login step.

---

## 3. Problems Solved

1. **Anchoring bias:** When senior developers vote early or speak their number, others adjust downward or upward. BlindScrum hides card values until the host flips the table.
2. **Database bloat:** Most estimation tools save old sessions in Postgres databases. BlindScrum keeps room state strictly in browser memory and WebSocket channels.
3. **Ceremony typing friction:** Leads spend meeting time switching tabs and typing out ticket summaries. The mic button lets them speak the title, which transcribes into the box live.
4. **Queue interruption:** In standard tools, adding the next ticket forces the team to stop or wait. BlindScrum includes a slide-out queue so anyone can queue upcoming tickets during the vote.

---

## 4. Requirements

### 4.1 Ephemeral Rooms & Link Sharing
- Room codes follow a simple pattern (like `SCRUM-492` or `BLND-92`).
- Links support `/room/[code]` or `/?room=CODE` auto-joining.
- Header includes a one-click copy button with toast feedback.

### 4.2 Personas & Avatars
- Each player gets a two-word agile name (like *Velocity Falcon* or *Agile Otter*).
- Avatars are generated as inline SVGs based on a string hash. No external image requests.
- Players can edit their name or click randomize in a profile modal.

### 4.3 Voice Input
- Uses the browser SpeechRecognition API.
- Shows live interim text while speaking.
- Stops automatically after 2 seconds of silence or when tapping outside the mic button.

### 4.4 Story Queue
- Anyone in the room can add upcoming tickets to the queue at any time.
- Queue drawer shows ordered tickets, who added them, and controls to move up or delete.
- Host can click "Next Story" to pop the first queued item into the arena, reset cards, and save the previous estimate to the completed log.

### 4.5 Secret Voting & 3D Table
- Standard Fibonacci cards: `1, 2, 3, 5, 8, 13, 20` plus `?` and coffee break.
- During voting, the app only broadcasts `{ hasVoted: true }`. Card numbers remain on the voter's device until the host clicks reveal.
- The table displays cards face-down with a pulse indicator while voting, and flips them around when revealed.

### 4.6 Analytics & Markdown Export
- Horizontal bar chart shows vote counts per card.
- Summary cards display average, consensus pick (with vote count and percentage), and spread (min to max).
- Confetti fires when 70% or more of the team picks the same number.
- Single button copies a formatted markdown table ready to paste into Jira, Linear, or Slack.

---

## 5. Technical Constraints

| Dimension | Target |
| :--- | :--- |
| **Storage** | Zero database storage. Rooms live in memory and WebSocket channels. |
| **Realtime** | WebSocket events broadcast in under 100ms. |
| **Accessibility** | Full keyboard support on card buttons, aria-pressed states, and 4.5:1 contrast. |
| **Deployment** | OpenNext Cloudflare Pages and Workers edge runtime. |
| **Assets** | Zero external audio or image dependencies. Sounds and SVGs are generated in the browser. |
