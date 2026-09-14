# System Architecture: BlindScrum

This document outlines the architecture, real-time protocols, state machine transitions, and data pipelines for BlindScrum.

---

## 1. System Overview

BlindScrum runs as a client-side real-time application with no database. State syncs directly between peers using WebRTC DataChannels orchestrated by Trystero (with public Nostr relay signaling and STUN), with a local browser BroadcastChannel fallback for multi-tab testing on the same machine.

```mermaid
flowchart LR
    subgraph Clients["Connected Client Endpoints"]
        HostClient(["Host Browser Session<br/>Room Creator Controller<br/>apps/web/src/app/room/[code]/page.tsx"])
        VoterA(["Participant A Browser<br/>Voice Input & Cards<br/>apps/web/src/app/room/[code]/page.tsx"])
        VoterB(["Participant B Browser<br/>Fibonacci Estimation Deck<br/>apps/web/src/app/room/[code]/page.tsx"])
    end

    subgraph RealtimeLayer["Ephemeral Realtime Transport Layer (P2P)"]
        NostrSignaling[("Nostr Signaling Relays<br/>Public WebSockets<br/>Peer Discovery & SDP Handshake")]
        WebRTCData[("WebRTC DataChannels<br/>Direct Peer-to-Peer Mesh<br/>Zero-Persistence Action Stream")]
        LocalBC[("Browser BroadcastChannel<br/>Fallback: blindscrum_CODE<br/>Same-Device Multi-Tab Sync")]
    end

    subgraph CoreHooks["Client Orchestration Subroutines"]
        SessionHook[["useScrumSession Hook<br/>State Machine & Presence<br/>apps/web/src/hooks/useScrumSession.ts"]]
        VoiceHook[["useVoiceSearch Hook<br/>W3C SpeechRecognition<br/>apps/web/src/hooks/useVoiceSearch.ts"]]
    end

    subgraph DomainEngines["Domain Logic & Computations"]
        QueueEngine["Story Queue State<br/>Async FIFO Buffer<br/>apps/web/src/types/scrum.ts"]
        AnalyticsEngine["Consensus Analytics<br/>Mean, Mode, & Spread<br/>apps/web/src/utils/analytics.ts"]
        AudioSynth["Procedural Audio Synth<br/>Web Audio Feedback<br/>apps/web/src/utils/soundEffects.ts"]
    end

    HostClient <--> SessionHook
    VoterA <--> SessionHook
    VoterB <--> SessionHook

    SessionHook <--> NostrSignaling
    SessionHook <--> WebRTCData
    SessionHook <--> LocalBC

    VoiceHook --> SessionHook
    SessionHook --> QueueEngine
    SessionHook --> AnalyticsEngine
    SessionHook --> AudioSynth
```

---

## 2. Estimation State Machine

The estimation cycle hides individual vote values during the voting phase to prevent anchoring. Card numbers stay on the voter's machine until the host triggers the reveal.

```mermaid
flowchart LR
    subgraph Phase1["Phase 1: Setup & Input"]
        IdleState(["IDLE / READY State<br/>Room active, cards open<br/>apps/web/src/types/scrum.ts"])
        HostInput["Host Sets Story Title<br/>Via typing or microphone<br/>apps/web/src/components/arena/StoryPipeline.tsx"]
        AsyncQueue["Teammates Queue Stories<br/>Pipeline & Drawer Additions<br/>apps/web/src/components/arena/StoryPipeline.tsx"]
    end

    subgraph Phase2["Phase 2: Blind Estimation"]
        VotingState(["VOTING State<br/>Cards displayed face-down<br/>apps/web/src/components/arena/PokerTable.tsx"])
        LocalHold[("Client-Local Memory<br/>Numerical vote value hidden<br/>apps/web/src/hooks/useScrumSession.ts")]
        WireToken["Broadcast Masked Token<br/>CAST_BLIND_VOTE: hasVoted=true<br/>Network Payload Masked"]
    end

    subgraph Phase3["Phase 3: Synchronized Reveal"]
        RevealTrigger{{"Host Clicks Reveal?<br/>apps/web/src/components/arena/PokerTable.tsx"}}
        RevealedState(["REVEALED State<br/>Synchronized 3D Card Flip<br/>apps/web/src/components/arena/PokerTable.tsx"])
        AnalyticsCompute["Compute Consensus Metrics<br/>Average, Mode, & Spread<br/>apps/web/src/utils/analytics.ts"]
        ConsensusGate{{"Consensus >= 70%?<br/>apps/web/src/utils/analytics.ts"}}
        Celebration["Audio Chime & Confetti<br/>playConsensusSound & canvas-confetti<br/>apps/web/src/hooks/useScrumSession.ts"]
    end

    IdleState --> HostInput
    HostInput --> VotingState
    AsyncQueue -.-> IdleState

    VotingState --> LocalHold
    LocalHold --> WireToken
    WireToken --> RevealTrigger

    RevealTrigger -- Yes --> RevealedState
    RevealedState --> AnalyticsCompute
    AnalyticsCompute --> ConsensusGate

    ConsensusGate -- Consensus Met --> Celebration
    ConsensusGate -- Divergence --> RevealedState

    RevealedState -->|Host Clicks Revote| VotingState
    RevealedState -->|Host Clicks Next Story| IdleState
```

---

## 3. Real-Time Voting Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Host as Host Client (Scrum Master)
    actor Voter as Voter Client (Teammate)
    participant Channel as WebRTC P2P DataChannel (blindscrum-[CODE])

    Note over Host, Voter: Round Begins in VOTING State
    Host->>Channel: broadcast UPDATE_TITLE ("OAuth2 Migration")
    Channel->>Voter: deliver UPDATE_TITLE ("OAuth2 Migration")

    Note over Voter: Voter Selects Fibonacci Card (e.g. 5 pts)
    Voter->>Voter: Store '5' in local memory (mySecretVoteRef)
    Voter->>Channel: broadcast CAST_BLIND_VOTE { participantId, hasVoted: true }
    Channel->>Host: deliver CAST_BLIND_VOTE (shows card face-down with glow)

    Note over Host: All Participants Have Voted
    Host->>Channel: broadcast REVEAL_VOTES { votes: { host: 5, voter: 5 } }
    Channel->>Voter: deliver REVEAL_VOTES

    Note over Host, Voter: Synchronized 3D Card Flip & Analytics Calculation
    Voter->>Voter: Render Bar Chart, Average (5.0), and Confetti
    Host->>Host: Render Bar Chart, Average (5.0), and Confetti
```

---

## 4. Voice Input Pipeline

```mermaid
flowchart LR
    MicClick(["User Taps Mic Button<br/>apps/web/src/components/arena/StoryInputBar.tsx"]) --> SupportCheck{{"SpeechRecognition Supported?<br/>apps/web/src/hooks/useVoiceSearch.ts"}}

    SupportCheck -- Yes --> StartEngine[["Initialize Web Speech API<br/>Continuous & Interim Active<br/>apps/web/src/hooks/useVoiceSearch.ts"]]
    SupportCheck -- No --> ToastFallback["Display Toast Alert<br/>Browser unsupported fallback<br/>sonner"]

    StartEngine --> StreamAudio["Audio Waveform Stream<br/>Visual pulsating red indicator<br/>apps/web/src/components/arena/StoryInputBar.tsx"]
    StreamAudio --> InterimProcess["Stream Interim Transcript<br/>Instant input field preview<br/>apps/web/src/hooks/useVoiceSearch.ts"]
    StreamAudio --> SilenceWatchdog[["Silence Watchdog Active<br/>2000ms inactivity countdown<br/>apps/web/src/hooks/useVoiceSearch.ts"]]

    SilenceWatchdog --> SilenceTrigger{{"2s Silence Detected?<br/>apps/web/src/hooks/useVoiceSearch.ts"}}
    SilenceTrigger -- Yes --> AutoStop["Auto-Stop Recognition<br/>Commit Final Title<br/>apps/web/src/components/arena/StoryInputBar.tsx"]
    SilenceTrigger -- No --> StreamAudio
```

---

## 5. Story Queue Transitions

```mermaid
flowchart LR
    subgraph QueueInput["Queue Addition (Anytime)"]
        UserAction(["Participant or Host Input<br/>Text or Spoken Moniker<br/>apps/web/src/components/queue/StoryQueueDrawer.tsx"]) --> AddEvent["Dispatch ADD_QUEUE_ITEM<br/>UUID, Title, & Timestamp<br/>apps/web/src/types/scrum.ts"]
        AddEvent --> QueueStore[("In-Memory Queue Buffer<br/>Ordered FIFO List<br/>apps/web/src/hooks/useScrumSession.ts")]
    end

    subgraph QueueReorder["Queue Management"]
        QueueStore --> MoveUp["Reorder Move Up<br/>apps/web/src/components/queue/StoryQueueDrawer.tsx"]
        QueueStore --> RemoveItem["Delete Story Item<br/>apps/web/src/components/queue/StoryQueueDrawer.tsx"]
    end

    subgraph NextTransition["Sequential Story Transition"]
        HostNext(["Host Clicks 'Next Story'<br/>apps/web/src/components/arena/PokerTable.tsx"]) --> ArchivePrev["Archive Active Story<br/>Append to Completed Log<br/>apps/web/src/types/scrum.ts"]
        ArchivePrev --> PopQueue["Pop First Queued Item<br/>Set as Active Story Title<br/>apps/web/src/hooks/useScrumSession.ts"]
        PopQueue --> ResetRound["Reset Round to VOTING<br/>Clear Cards & Analytics<br/>apps/web/src/hooks/useScrumSession.ts"]
    end
```

---

## 6. Real-Time Table Reactions & Micro-Interactions Pipeline

```mermaid
flowchart LR
    subgraph Trigger["User Action"]
        GuestClick(["Click Teammate Seat<br/>Card or Avatar Interaction<br/>apps/web/src/components/arena/PokerTable.tsx"]) --> PopoverMenu["Display Reaction Picker<br/>Egg, Tomato, Gas, Cheers, Zap<br/>apps/web/src/components/arena/PokerTable.tsx"]
        PopoverMenu --> SelectThrowable["Select Reaction Type<br/>apps/web/src/types/scrum.ts"]
    end

    subgraph Dispatch["Realtime Dispatch & Sound"]
        SelectThrowable --> LocalSynth["Synthesize Procedural Audio<br/>Zero-Asset Web Audio API<br/>apps/web/src/utils/soundEffects.ts"]
        SelectThrowable --> BroadcastEvent["Broadcast THROW_REACTION<br/>Sender ID, Target ID, Type<br/>apps/web/src/hooks/useScrumSession.ts"]
    end

    subgraph Render["Synchronized Peer Rendering"]
        BroadcastEvent --> PeerHook[["Peer Session Handler<br/>Ephemeral Queue Append<br/>apps/web/src/hooks/useScrumSession.ts"]]
        PeerHook --> PeerSynth["Synthesize Peer Audio<br/>playReactionSound<br/>apps/web/src/utils/soundEffects.ts"]
        PeerHook --> AnimationLayer["Render Visual FX Layer<br/>Arc Fly-In, Splatter, Shake<br/>apps/web/src/components/arena/PokerTable.tsx"]
        AnimationLayer --> AutoPrune["Automatic Ephemeral Pruning<br/>3000ms State Eviction<br/>apps/web/src/hooks/useScrumSession.ts"]
    end
```
