# BlindScrum: Technical Architecture & System Design

This document details the high-fidelity system design, real-time protocols, state machines, and data flow pipelines that power **BlindScrum**.

---

## 1. High-Level System Architecture

BlindScrum operates as an ephemeral real-time client application with zero persistent storage requirements. State is synchronized across peers using WebSocket presence and broadcast clusters with a multi-tab BroadcastChannel failover.

```mermaid
flowchart LR
    subgraph Clients["Connected Team Clients"]
        Host["Host Client\n(Room Creator)"]
        Voter1["Participant A\n(Voice / Text Input)"]
        Voter2["Participant B\n(Fibonacci Deck)"]
    end

    subgraph RealtimeSync["Ephemeral Synchronization Layer"]
        SupabasePresence["Supabase Realtime\nPresence Channel\n(blindscrum:CODE)"]
        SupabaseBroadcast["Supabase Realtime\nBroadcast Channel\n(scrum_event)"]
        LocalBC["Browser Native\nBroadcastChannel\n(Same-Device Fallback)"]
    end

    subgraph DomainCore["Domain Engine & State"]
        StateMachine["Scrum Session State\n(useScrumSession)"]
        VoiceEngine["Speech-to-Text\n(useVoiceSearch)"]
        QueueSystem["Async Story Queue\n(FIFO / Reorder)"]
        AnalyticsEngine["Consensus Analytics\n(calculateVoteAnalytics)"]
    end

    Host <--> SupabasePresence
    Host <--> SupabaseBroadcast
    Voter1 <--> SupabasePresence
    Voter1 <--> SupabaseBroadcast
    Voter2 <--> SupabasePresence
    Voter2 <--> SupabaseBroadcast

    SupabaseBroadcast <--> StateMachine
    LocalBC <--> StateMachine
    VoiceEngine --> StateMachine
    StateMachine --> QueueSystem
    StateMachine --> AnalyticsEngine
```

---

## 2. Ephemeral Estimation Lifecycle State Machine

The core estimation workflow enforces cognitive neutrality through a strict 3-phase state machine:

```mermaid
flowchart LR
    IDLE["1. IDLE / SETUP\nHost sets project title\nTeammates join via URL"] --> VOTING["2. VOTING (Blind)\nCards locked face down\nBroadcast {hasVoted: true}\nValue held locally"]
    VOTING --> REVEALED["3. REVEALED\nSynchronized 3D card flip\nAnalytics rendered\nConfetti on consensus"]
    REVEALED -->|Revote / Outlier Debate| VOTING
    REVEALED -->|Pop Next Story| IDLE
```

### Stage Details:
1. **Setup / Story Input:**
   - Host types or speaks a story title via the microphone button (`useVoiceSearch`).
   - Teammates can asynchronously append upcoming items into the story queue drawer at any time.
2. **Blind Voting:**
   - Voters tap their card from the Fibonacci sequence (`1, 2, 3, 5, 8, 13, 20, ?, ☕`).
   - The selected number is stored in local client memory.
   - Only a masked token `{ participantId, hasVoted: true }` is transmitted across the wire to avoid network inspection leaks.
3. **Reveal & Analytics:**
   - Host clicks **"Reveal Votes"**.
   - Host transmits the revealed vote mapping across the broadcast channel.
   - All client tables execute a synchronized 3D card flip.
   - The analytics engine computes arithmetic mean, mode (majority choice), and divergence spread, rendering the distribution bar chart.

---

## 3. Voice-to-Text Story Input Pipeline

Speech recognition leverages the browser-native W3C `SpeechRecognition` API adapted from `kxnghans.github.io`:

```mermaid
flowchart LR
    MicTrigger["User clicks Mic Button"] --> InitSpeech["Initialize Web Speech Engine\n(en-US, continuous, interim)"]
    InitSpeech --> AudioStream["Audio Input Stream"]
    AudioStream --> InterimResult["Interim Transcript\n(Live UI Preview)"]
    AudioStream --> FinalResult["Final Transcript\n(Auto-Populate Title)"]
    AudioStream --> SilenceDetect["Silence Watchdog\n(2000ms Inactivity)"]
    SilenceDetect --> StopRecognition["Auto-Halt & Commit\n(playCardSelectSound)"]
```

---

## 4. Asynchronous Story Queue Architecture

The asynchronous queue enables continuous sprint sizing without interrupting current discussions:

```mermaid
flowchart LR
    ParticipantInput["Any Participant\n(Voice or Text)"] --> QuickQueue["Click 'Queue' / Enter"]
    QuickQueue --> BroadcastAdd["Broadcast ADD_QUEUE_ITEM"]
    BroadcastAdd --> ActiveList["Drawer Queue List\n(#1, #2, #3...)"]
    ActiveList --> HostNext["Host clicks 'Next Story'"]
    HostNext --> ArchiveOld["Archive Current Story\n(with Consensus Points)"]
    HostNext --> PopNew["Pop #1 into Active Sizing\n(Reset Cards to Voting)"]
```

---

## 5. Security & Boundary Guardrails

1. **Zero Persistence:**
   - No database queries (`SELECT`/`INSERT`) are executed.
   - No cookies, tokens, or PII are persisted on the server or edge worker.
2. **True Blind Protection:**
   - Voting values remain isolated on the client until the reveal broadcast, eliminating inspectable JSON payload leaks during active voting.
3. **Input Sanitization:**
   - Story titles and monikers are trimmed, bounded to safe lengths, and rendered using React DOM escaping to prevent XSS.
