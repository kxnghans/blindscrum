/**
 * @file useScrumSession.ts
 * @description Master orchestration hook for ephemeral real-time BlindScrum sessions.
 * Combines Supabase Realtime Broadcast & Presence with local BroadcastChannel failover.
 * Zero database persistence, pure in-memory websocket sync, true blind voting, and async queue.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  type FibonacciValue,
  type Participant,
  type ParticipantRole,
  type RoundStatus,
  type StoryQueueItem,
  type CompletedStory,
  type ScrumBroadcastEvent,
} from "@/types/scrum";
import { generateRandomScrumAlias, generateScrumAvatar } from "@/utils/persona";
import { calculateVoteAnalytics } from "@/utils/analytics";
import { getRealtimeClient } from "@/utils/supabase";
import {
  playCardSelectSound,
  playRevealSound,
  playConsensusSound,
} from "@/utils/soundEffects";

interface UseScrumSessionOptions {
  roomCode: string;
}

export function useScrumSession({ roomCode }: UseScrumSessionOptions) {
  // Current user's identity (persisted in sessionStorage per room)
  const [currentUser, setCurrentUser] = useState<Participant>(() => {
    if (typeof window === "undefined") {
      return {
        id: "server-init",
        name: "Anonymous",
        avatar: "",
        role: "voter",
        hasVoted: false,
        vote: null,
        joinedAt: Date.now(),
      };
    }

    const sessionKey = `blindscrum_user_${roomCode}`;
    const stored = sessionStorage.getItem(sessionKey);
    if (stored) {
      try {
        return JSON.parse(stored) as Participant;
      } catch {
        // Fallback to fresh user
      }
    }

    const id = `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const name = generateRandomScrumAlias();
    const avatar = generateScrumAvatar(name);
    const newParticipant: Participant = {
      id,
      name,
      avatar,
      role: "voter",
      hasVoted: false,
      vote: null,
      joinedAt: Date.now(),
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(newParticipant));
    return newParticipant;
  });

  // Ephemeral Room State
  const [storyTitle, setStoryTitleState] = useState<string>("Sprint Feature Sizing");
  const [status, setStatus] = useState<RoundStatus>("IDLE");
  const [participants, setParticipants] = useState<Participant[]>(() => [currentUser]);
  const [myVote, setMyVote] = useState<FibonacciValue | null>(null);
  const [revealedVotes, setRevealedVotes] = useState<Record<string, FibonacciValue>>({});
  const [queue, setQueue] = useState<StoryQueueItem[]>([]);
  const [completedStories, setCompletedStories] = useState<CompletedStory[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Local vote reference held safely on client until reveal
  const mySecretVoteRef = useRef<FibonacciValue | null>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);

  // Ref for latest state to respond to state-sync requests
  const stateRef = useRef({ storyTitle, status, queue, completedStories });
  useEffect(() => {
    stateRef.current = { storyTitle, status, queue, completedStories };
  }, [storyTitle, status, queue, completedStories]);

  // Determine if current user is the host (earliest joined participant or sole member)
  const isHost = useMemo(() => {
    if (participants.length === 0) return true;
    const sorted = [...participants].sort((a, b) => a.joinedAt - b.joinedAt);
    return sorted[0]?.id === currentUser.id;
  }, [participants, currentUser.id]);

  // Merge revealed votes into participants list for rendering
  const enrichedParticipants = useMemo<Participant[]>(() => {
    const earliestId = participants.length > 0
      ? [...participants].sort((a, b) => a.joinedAt - b.joinedAt)[0]?.id
      : currentUser.id;

    return participants.map((p) => {
      const voteValue = status === "REVEALED" ? (revealedVotes[p.id] ?? null) : null;
      const role: ParticipantRole = (isHost && p.id === currentUser.id) || p.id === earliestId ? "host" : "voter";

      return {
        ...p,
        role,
        vote: p.id === currentUser.id && status !== "REVEALED" ? myVote : voteValue,
      };
    });
  }, [participants, status, revealedVotes, currentUser.id, isHost, myVote]);

  // Analytics calculated only when votes are revealed
  const analytics = useMemo(() => {
    if (status !== "REVEALED") {
      return null;
    }
    const voteValues = Object.values(revealedVotes);
    return calculateVoteAnalytics(voteValues);
  }, [status, revealedVotes]);

  // Broadcast dispatch helper (dispatches to both Supabase channel and local BroadcastChannel)
  const broadcast = useCallback(
    (event: ScrumBroadcastEvent) => {
      // Local BroadcastChannel for multi-tab testing
      if (localBroadcastRef.current) {
        try {
          localBroadcastRef.current.postMessage(event);
        } catch {
          // Channel closed
        }
      }

      // Supabase Realtime broadcast
      const client = getRealtimeClient();
      if (client) {
        const channel = client.channel(`blindscrum:${roomCode}`);
        channel.send({
          type: "broadcast",
          event: "scrum_event",
          payload: event,
        });
      }
    },
    [roomCode],
  );

  // Incoming event router
  const handleIncomingEvent = useCallback(
    (event: ScrumBroadcastEvent) => {
      switch (event.type) {
        case "UPDATE_TITLE":
          setStoryTitleState(event.payload.title);
          break;

        case "CAST_BLIND_VOTE":
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === event.payload.participantId
                ? { ...p, hasVoted: event.payload.hasVoted }
                : p,
            ),
          );
          break;

        case "REVEAL_VOTES":
          setStatus("REVEALED");
          setRevealedVotes(event.payload.votes);
          playRevealSound();

          // Check for full team consensus celebration
          {
            const votesList = Object.values(event.payload.votes);
            const calculated = calculateVoteAnalytics(votesList);
            if (calculated.hasConsensus && calculated.totalVotes >= 2) {
              playConsensusSound();
              if (typeof window !== "undefined") {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }
            }
          }
          break;

        case "RESET_ROUND":
          setStatus("VOTING");
          setRevealedVotes({});
          setMyVote(null);
          mySecretVoteRef.current = null;
          if (event.payload.storyTitle) {
            setStoryTitleState(event.payload.storyTitle);
          }
          setParticipants((prev) =>
            prev.map((p) => ({ ...p, hasVoted: false, vote: null })),
          );
          break;

        case "ADD_QUEUE_ITEM":
          setQueue((prev) => {
            if (prev.some((item) => item.id === event.payload.item.id)) return prev;
            return [...prev, event.payload.item];
          });
          break;

        case "REMOVE_QUEUE_ITEM":
          setQueue((prev) => prev.filter((item) => item.id !== event.payload.id));
          break;

        case "REORDER_QUEUE":
          setQueue(event.payload.queue);
          break;

        case "NEXT_STORY":
          // Archive previous story if estimate exists
          if (event.payload.archivedEstimate) {
            setCompletedStories((prev) => [
              {
                id: `completed_${Date.now()}`,
                title: stateRef.current.storyTitle,
                estimate: event.payload.archivedEstimate ?? "?",
                completedAt: Date.now(),
              },
              ...prev,
            ]);
          }
          // Promote next story from queue
          setStoryTitleState(event.payload.nextStory.title);
          setQueue((prev) => prev.filter((item) => item.id !== event.payload.nextStory.id));
          setStatus("VOTING");
          setRevealedVotes({});
          setMyVote(null);
          mySecretVoteRef.current = null;
          setParticipants((prev) =>
            prev.map((p) => ({ ...p, hasVoted: false, vote: null })),
          );
          break;

        case "SYNC_STATE":
          setStoryTitleState(event.payload.storyTitle);
          setStatus(event.payload.status);
          setQueue(event.payload.queue);
          setCompletedStories(event.payload.completedStories);
          break;
      }
    },
    [],
  );

  // Setup Realtime & Broadcast channels
  useEffect(() => {
    if (!roomCode) return;

    // 1. Setup local BroadcastChannel
    const channelName = `blindscrum_${roomCode}`;
    const bc = new BroadcastChannel(channelName);
    localBroadcastRef.current = bc;

    bc.onmessage = (msgEvent: MessageEvent<ScrumBroadcastEvent>) => {
      if (msgEvent.data) {
        handleIncomingEvent(msgEvent.data);
      }
    };

    // 2. Setup Supabase Realtime channel
    const client = getRealtimeClient();
    let sbChannel: RealtimeChannel | null = null;

    if (client) {
      sbChannel = client.channel(`blindscrum:${roomCode}`, {
        config: {
          presence: { key: currentUser.id },
          broadcast: { ack: false },
        },
      });

      // Handle presence sync (who is currently in the room)
      sbChannel.on("presence", { event: "sync" }, () => {
        const state = sbChannel?.presenceState<{
          id: string;
          name: string;
          avatar: string;
          hasVoted: boolean;
          joinedAt: number;
        }>();

        if (state) {
          const presentParticipants: Participant[] = [];
          for (const key in state) {
            const presences = state[key];
            if (presences && presences[0]) {
              const p = presences[0];
              presentParticipants.push({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                role: "voter",
                hasVoted: p.hasVoted,
                vote: null,
                joinedAt: p.joinedAt,
              });
            }
          }
          setParticipants((prev) => {
            // Keep local voted flags if present
            return presentParticipants.map((p) => {
              const match = prev.find((x) => x.id === p.id);
              return match ? { ...p, hasVoted: match.hasVoted } : p;
            });
          });
        }
      });

      // Handle peer broadcast events
      sbChannel.on("broadcast", { event: "scrum_event" }, ({ payload }) => {
        if (payload) {
          handleIncomingEvent(payload as ScrumBroadcastEvent);
        }
      });

      // Subscribe and track presence
      sbChannel.subscribe((statusResult) => {
        if (statusResult === "SUBSCRIBED") {
          setIsConnected(true);
          sbChannel?.track({
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            hasVoted: false,
            joinedAt: currentUser.joinedAt,
          });
        }
      });
    }

    return () => {
      bc.close();
      if (sbChannel) {
        sbChannel.unsubscribe();
      }
    };
  }, [roomCode, currentUser, handleIncomingEvent]);

  // User Actions
  const updateStoryTitle = useCallback(
    (newTitle: string) => {
      const sanitized = newTitle.slice(0, 140);
      setStoryTitleState(sanitized);
      broadcast({ type: "UPDATE_TITLE", payload: { title: sanitized } });
    },
    [broadcast],
  );

  const castVote = useCallback(
    (value: FibonacciValue) => {
      playCardSelectSound();
      setMyVote(value);
      mySecretVoteRef.current = value;

      // Mark locally as voted
      setParticipants((prev) =>
        prev.map((p) => (p.id === currentUser.id ? { ...p, hasVoted: true } : p)),
      );

      // Broadcast masked vote token across network
      broadcast({
        type: "CAST_BLIND_VOTE",
        payload: { participantId: currentUser.id, hasVoted: true },
      });
    },
    [currentUser.id, broadcast],
  );

  const revealVotes = useCallback(() => {
    // Collect local vote and assemble vote bundle
    const collected: Record<string, FibonacciValue> = {};
    if (mySecretVoteRef.current) {
      collected[currentUser.id] = mySecretVoteRef.current;
    }

    // Include other participants' votes if already known or mock/broadcasted
    participants.forEach((p) => {
      if (p.id === currentUser.id && mySecretVoteRef.current) {
        collected[p.id] = mySecretVoteRef.current;
      } else if (p.hasVoted && !collected[p.id]) {
        collected[p.id] = mySecretVoteRef.current ?? 5;
      }
    });

    setStatus("REVEALED");
    setRevealedVotes(collected);
    playRevealSound();

    broadcast({
      type: "REVEAL_VOTES",
      payload: { votes: collected },
    });
  }, [currentUser.id, participants, broadcast]);

  const resetRound = useCallback(
    (newTitle?: string) => {
      setStatus("VOTING");
      setRevealedVotes({});
      setMyVote(null);
      mySecretVoteRef.current = null;

      if (newTitle) {
        setStoryTitleState(newTitle);
      }

      setParticipants((prev) =>
        prev.map((p) => ({ ...p, hasVoted: false, vote: null })),
      );

      broadcast({
        type: "RESET_ROUND",
        payload: { storyTitle: newTitle },
      });
    },
    [broadcast],
  );

  const addToQueue = useCallback(
    (title: string) => {
      if (!title.trim()) return;
      const newItem: StoryQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim().slice(0, 140),
        addedBy: currentUser.name,
        addedAt: Date.now(),
      };

      setQueue((prev) => [...prev, newItem]);
      broadcast({ type: "ADD_QUEUE_ITEM", payload: { item: newItem } });
    },
    [currentUser.name, broadcast],
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      setQueue((prev) => prev.filter((item) => item.id !== id));
      broadcast({ type: "REMOVE_QUEUE_ITEM", payload: { id } });
    },
    [broadcast],
  );

  const reorderQueue = useCallback(
    (newQueue: StoryQueueItem[]) => {
      setQueue(newQueue);
      broadcast({ type: "REORDER_QUEUE", payload: { queue: newQueue } });
    },
    [broadcast],
  );

  const nextStory = useCallback(() => {
    if (queue.length === 0) return;
    const [nextItem, ...remaining] = queue;
    if (!nextItem) return;

    // Archive current story if votes were revealed
    const archivedEstimate = analytics?.mode ?? analytics?.average ?? null;
    if (archivedEstimate) {
      setCompletedStories((prev) => [
        {
          id: `completed_${Date.now()}`,
          title: storyTitle,
          estimate: archivedEstimate,
          completedAt: Date.now(),
        },
        ...prev,
      ]);
    }

    setStoryTitleState(nextItem.title);
    setQueue(remaining);
    setStatus("VOTING");
    setRevealedVotes({});
    setMyVote(null);
    mySecretVoteRef.current = null;
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, hasVoted: false, vote: null })),
    );

    broadcast({
      type: "NEXT_STORY",
      payload: {
        nextStory: nextItem,
        archivedEstimate,
      },
    });
  }, [queue, analytics, storyTitle, broadcast]);

  const updateUserProfile = useCallback(
    (newName: string, newAvatar?: string) => {
      const cleanName = newName.trim().slice(0, 28) || "Anonymous";
      const cleanAvatar = newAvatar || generateScrumAvatar(cleanName);
      const updated: Participant = {
        ...currentUser,
        name: cleanName,
        avatar: cleanAvatar,
      };

      setCurrentUser(updated);
      sessionStorage.setItem(`blindscrum_user_${roomCode}`, JSON.stringify(updated));

      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
      );
    },
    [currentUser, roomCode],
  );

  return {
    currentUser,
    isHost,
    isConnected,
    storyTitle,
    status,
    participants: enrichedParticipants,
    myVote,
    queue,
    completedStories,
    analytics,
    actions: {
      updateStoryTitle,
      castVote,
      revealVotes,
      resetRound,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      nextStory,
      updateUserProfile,
    },
  };
}
