/**
 * @file useScrumSession.ts
 * @description Master orchestration hook for ephemeral real-time BlindScrum sessions.
 * Uses serverless WebRTC Peer-to-Peer data channels with local BroadcastChannel failover.
 * Zero database persistence, true blind voting, decentralized peer state synchronization, and async queue.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  type FibonacciValue,
  type Participant,
  type ParticipantRole,
  type RoundStatus,
  type StoryQueueItem,
  type CompletedStory,
  type ScrumBroadcastEvent,
  type ScrumRoomState,
  type TableReactionType,
  type TableReactionPayload,
  MAX_STORY_TITLE_LENGTH,
  MAX_PERSONA_NAME_LENGTH,
} from "@/types/scrum";
import { generateRandomScrumAlias, generateScrumAvatar } from "@/utils/persona";
import { calculateVoteAnalytics } from "@/utils/analytics";
import { createP2PSession, type P2PSession } from "@/utils/p2p";
import {
  playCardSelectSound,
  playRevealSound,
  playConsensusSound,
  playReactionSound,
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
  const [storyTitle, setStoryTitleState] = useState<string>("");
  const [status, setStatus] = useState<RoundStatus>("IDLE");
  const [participants, setParticipants] = useState<Participant[]>(() => [
    currentUser,
  ]);
  const [myVote, setMyVote] = useState<FibonacciValue | null>(null);
  const [revealedVotes, setRevealedVotes] = useState<
    Record<string, FibonacciValue>
  >({});
  const [queue, setQueue] = useState<StoryQueueItem[]>([]);
  const [completedStories, setCompletedStories] = useState<CompletedStory[]>(
    [],
  );
  const [activeReactions, setActiveReactions] = useState<
    TableReactionPayload[]
  >([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Local vote reference held safely on client until reveal
  const mySecretVoteRef = useRef<FibonacciValue | null>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);
  const p2pSessionRef = useRef<P2PSession | null>(null);
  const peerPersonasRef = useRef<Map<string, Participant>>(new Map());
  const lastSeenRef = useRef<Map<string, number>>(new Map());
  const lastReactionTimeRef = useRef<number>(0);

  // Ref for latest state to respond to state-sync requests from new peers
  const stateRef = useRef({
    storyTitle,
    status,
    queue,
    completedStories,
    participants,
  });
  useEffect(() => {
    stateRef.current = {
      storyTitle,
      status,
      queue,
      completedStories,
      participants,
    };
  }, [storyTitle, status, queue, completedStories, participants]);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Determine if current user is the host (earliest joined participant or sole member)
  const isHost = useMemo(() => {
    if (participants.length === 0) return true;
    const sorted = [...participants].sort(
      (a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id),
    );
    return sorted[0]?.id === currentUser.id;
  }, [participants, currentUser.id]);

  const isHostRef = useRef(isHost);
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Merge revealed votes into participants list for rendering
  const enrichedParticipants = useMemo<Participant[]>(() => {
    const earliestId =
      participants.length > 0
        ? [...participants].sort(
            (a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id),
          )[0]?.id
        : currentUser.id;

    return participants.map((p) => {
      const voteValue =
        status === "REVEALED" ? (revealedVotes[p.id] ?? null) : null;
      const role: ParticipantRole =
        (isHost && p.id === currentUser.id) || p.id === earliestId
          ? "host"
          : "voter";

      return {
        ...p,
        role,
        vote:
          p.id === currentUser.id && status !== "REVEALED" ? myVote : voteValue,
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

  // Broadcast dispatch helper (dispatches to both P2P WebRTC data channels and local BroadcastChannel)
  const broadcast = useCallback((event: ScrumBroadcastEvent) => {
    // Local BroadcastChannel for multi-tab testing on the same browser
    if (localBroadcastRef.current) {
      try {
        localBroadcastRef.current.postMessage(event);
      } catch {
        // Channel closed
      }
    }

    // WebRTC P2P DataChannel broadcast
    if (p2pSessionRef.current) {
      p2pSessionRef.current.broadcast(event);
    }
  }, []);

  // Incoming event router
  const handleIncomingEvent = useCallback(
    (event: ScrumBroadcastEvent) => {
      switch (event.type) {
        case "UPDATE_TITLE":
          setStoryTitleState(event.payload.title);
          setStatus((prev) =>
            prev === "IDLE" && event.payload.title.trim() ? "VOTING" : prev,
          );
          break;

        case "CAST_BLIND_VOTE":
          setParticipants((prev) => {
            const exists = prev.some(
              (p) => p.id === event.payload.participantId,
            );
            if (!exists) {
              return [
                ...prev,
                {
                  id: event.payload.participantId,
                  name: "Teammate",
                  avatar: "",
                  role: "voter",
                  hasVoted: event.payload.hasVoted,
                  vote: null,
                  joinedAt: Date.now(),
                },
              ];
            }
            return prev.map((p) =>
              p.id === event.payload.participantId
                ? { ...p, hasVoted: event.payload.hasVoted }
                : p,
            );
          });
          break;

        case "REVEAL_VOTES": {
          setStatus("REVEALED");
          const myId = currentUserRef.current.id;
          const mergedVotes = {
            ...event.payload.votes,
            ...(mySecretVoteRef.current !== null
              ? { [myId]: mySecretVoteRef.current }
              : {}),
          };
          setRevealedVotes(mergedVotes);
          playRevealSound();

          // If local secret vote differed or was missing from incoming bundle, rebroadcast merged votes
          if (
            mySecretVoteRef.current !== null &&
            event.payload.votes[myId] !== mySecretVoteRef.current
          ) {
            broadcast({
              type: "REVEAL_VOTES",
              payload: { votes: mergedVotes },
            });
          }

          // Check for full team consensus celebration
          const votesList = Object.values(mergedVotes);
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
          break;
        }

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
            if (
              prev.length >= 50 ||
              prev.some((item) => item.id === event.payload.item.id)
            ) {
              return prev;
            }
            const sanitizedItem = {
              ...event.payload.item,
              title: event.payload.item.title.slice(0, MAX_STORY_TITLE_LENGTH),
            };
            return [...prev, sanitizedItem];
          });
          break;

        case "REMOVE_QUEUE_ITEM":
          setQueue((prev) =>
            prev.filter((item) => item.id !== event.payload.id),
          );
          break;

        case "REORDER_QUEUE":
          setQueue(event.payload.queue);
          break;

        case "NEXT_STORY":
          // Archive previous story if estimate exists
          if (typeof event.payload.archivedEstimate === "number") {
            const estimateVal = event.payload.archivedEstimate;
            setCompletedStories((prev) => [
              {
                id: `completed_${Date.now()}`,
                title: stateRef.current.storyTitle,
                estimate: estimateVal,
                completedAt: Date.now(),
              },
              ...prev,
            ]);
          }
          // Promote next story from queue
          setStoryTitleState(event.payload.nextStory.title);
          setQueue((prev) =>
            prev.filter((item) => item.id !== event.payload.nextStory.id),
          );
          setStatus("VOTING");
          setRevealedVotes({});
          setMyVote(null);
          mySecretVoteRef.current = null;
          setParticipants((prev) =>
            prev.map((p) => ({ ...p, hasVoted: false, vote: null })),
          );
          break;

        case "SYNC_REQUEST":
          // Host peer fulfills sync request for newcomer
          if (isHostRef.current) {
            const snapshot: ScrumRoomState = {
              roomCode,
              storyTitle: stateRef.current.storyTitle,
              status: stateRef.current.status,
              participants: stateRef.current.participants,
              queue: stateRef.current.queue,
              completedStories: stateRef.current.completedStories,
            };
            broadcast({ type: "SYNC_STATE", payload: snapshot });
          }
          break;

        case "SYNC_STATE":
          setStoryTitleState(event.payload.storyTitle);
          setStatus(event.payload.status);
          setQueue(event.payload.queue);
          setCompletedStories(event.payload.completedStories);
          if (
            event.payload.participants &&
            event.payload.participants.length > 0
          ) {
            setParticipants((prev) => {
              const map = new Map<string, Participant>();
              map.set(currentUserRef.current.id, currentUserRef.current);
              for (const p of event.payload.participants) {
                if (p.id !== currentUserRef.current.id) map.set(p.id, p);
              }
              for (const p of prev) {
                if (!map.has(p.id)) map.set(p.id, p);
              }
              return Array.from(map.values());
            });
          }
          break;

        case "THROW_REACTION":
          playReactionSound(event.payload.type);
          setActiveReactions((prev) => [...prev.slice(-15), event.payload]);
          setTimeout(() => {
            setActiveReactions((prev) =>
              prev.filter((r) => r.id !== event.payload.id),
            );
          }, 3000);
          break;

        case "HEARTBEAT": {
          const senderId = event.payload.id;
          if (senderId !== currentUserRef.current.id) {
            lastSeenRef.current.set(senderId, Date.now());
          }
          break;
        }

        case "PEER_ANNOUNCE": {
          const peer = event.payload;
          if (peer.id !== currentUserRef.current.id) {
            lastSeenRef.current.set(peer.id, Date.now());
            setParticipants((prev) => {
              const exists = prev.some((p) => p.id === peer.id);
              if (!exists) {
                // Reply with our own identity so the new peer immediately learns about us
                broadcast({
                  type: "PEER_ANNOUNCE",
                  payload: currentUserRef.current,
                });
                return [...prev, peer];
              }
              return prev.map((p) =>
                p.id === peer.id ? { ...p, ...peer } : p,
              );
            });
          }
          break;
        }

        case "PEER_LEAVE": {
          const departingId = event.payload.id;
          if (departingId !== currentUserRef.current.id) {
            lastSeenRef.current.delete(departingId);
            setParticipants((prev) => prev.filter((p) => p.id !== departingId));
          }
          break;
        }
      }
    },
    [broadcast, roomCode],
  );

  const handleIncomingEventRef = useRef(handleIncomingEvent);
  useEffect(() => {
    handleIncomingEventRef.current = handleIncomingEvent;
  });

  // Setup WebRTC P2P Session & local BroadcastChannel
  useEffect(() => {
    if (!roomCode) return;

    // 1. Setup local BroadcastChannel for same-device multi-tab testing
    const channelName = `blindscrum_${roomCode}`;
    const bc = new BroadcastChannel(channelName);
    localBroadcastRef.current = bc;

    bc.onmessage = (msgEvent: MessageEvent<ScrumBroadcastEvent>) => {
      if (msgEvent.data) {
        handleIncomingEventRef.current(msgEvent.data);
      }
    };

    // 2. Setup serverless WebRTC P2P data channels via Trystero
    const peerPersonas = peerPersonasRef.current;
    const p2p = createP2PSession({
      roomCode,
      currentUser: currentUserRef.current,
      onEvent: (event) => {
        handleIncomingEventRef.current(event);
      },
      onPeerJoin: () => {
        setIsConnected(true);
        // Request room state sync from existing peers
        p2p?.broadcast({
          type: "SYNC_REQUEST",
          payload: { requesterId: currentUserRef.current.id },
        });
      },
      onPeerLeave: (peerId) => {
        const departing = peerPersonas.get(peerId);
        if (departing) {
          peerPersonas.delete(peerId);
          setParticipants((prev) => prev.filter((p) => p.id !== departing.id));
        }
      },
      onPeerPersona: (peerId, participant) => {
        if (participant.id !== currentUserRef.current.id) {
          peerPersonas.set(peerId, participant);
          setParticipants((prev) => {
            const others = prev.filter((p) => p.id !== participant.id);
            return [...others, participant];
          });
        }
      },
    });

    p2pSessionRef.current = p2p;

    // Announce identity and request room state snapshot across both channels
    broadcast({ type: "PEER_ANNOUNCE", payload: currentUserRef.current });
    broadcast({
      type: "SYNC_REQUEST",
      payload: { requesterId: currentUserRef.current.id },
    });

    // Periodic heartbeat to detect unexpected peer / host network drops
    const heartbeatInterval = setInterval(() => {
      const now = Date.now();
      broadcast({
        type: "HEARTBEAT",
        payload: { id: currentUserRef.current.id, timestamp: now },
      });

      // Sweep peers: if peer has not sent any message or heartbeat in 8s, drop them so mesh failover triggers
      setParticipants((prev) => {
        const deadPeers = prev.filter(
          (p) =>
            p.id !== currentUserRef.current.id &&
            lastSeenRef.current.has(p.id) &&
            now - (lastSeenRef.current.get(p.id) ?? 0) > 8000,
        );
        if (deadPeers.length === 0) return prev;
        deadPeers.forEach((p) => lastSeenRef.current.delete(p.id));
        return prev.filter((p) => !deadPeers.some((d) => d.id === p.id));
      });
    }, 3000);

    // Graceful peer departure handler on tab close / reload
    const handleBeforeUnload = () => {
      try {
        if (localBroadcastRef.current) {
          localBroadcastRef.current.postMessage({
            type: "PEER_LEAVE",
            payload: { id: currentUserRef.current.id },
          });
        }
      } catch {
        // Channel closed
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
      bc.close();
      if (p2p) {
        p2p.destroy();
      }
      p2pSessionRef.current = null;
      peerPersonas.clear();
    };
  }, [roomCode, broadcast]);

  // User Actions
  const updateStoryTitle = useCallback(
    (newTitle: string) => {
      const sanitized = newTitle.slice(0, MAX_STORY_TITLE_LENGTH);
      setStoryTitleState(sanitized);
      setStatus((prev) =>
        prev === "IDLE" && sanitized.trim() ? "VOTING" : prev,
      );
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
        prev.map((p) =>
          p.id === currentUser.id ? { ...p, hasVoted: true } : p,
        ),
      );

      // Broadcast masked vote token across P2P network
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
    if (mySecretVoteRef.current !== null) {
      collected[currentUser.id] = mySecretVoteRef.current;
    }

    // Include any previously revealed votes if present
    Object.entries(revealedVotes).forEach(([pid, val]) => {
      if (val !== null && val !== undefined) {
        collected[pid] = val;
      }
    });

    setStatus("REVEALED");
    setRevealedVotes(collected);
    playRevealSound();

    broadcast({
      type: "REVEAL_VOTES",
      payload: { votes: collected },
    });
  }, [currentUser.id, revealedVotes, broadcast]);

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
        title: title.trim().slice(0, MAX_STORY_TITLE_LENGTH),
        addedBy: currentUser.name,
        addedAt: Date.now(),
      };

      setQueue((prev) => (prev.length >= 50 ? prev : [...prev, newItem]));
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
    if (typeof archivedEstimate === "number") {
      const estimateVal = archivedEstimate;
      setCompletedStories((prev) => [
        {
          id: `completed_${Date.now()}`,
          title: storyTitle,
          estimate: estimateVal,
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
      const cleanName =
        newName.trim().slice(0, MAX_PERSONA_NAME_LENGTH) || "Anonymous";
      const cleanAvatar = newAvatar || generateScrumAvatar(cleanName);
      const updated: Participant = {
        ...currentUser,
        name: cleanName,
        avatar: cleanAvatar,
      };

      setCurrentUser(updated);
      sessionStorage.setItem(
        `blindscrum_user_${roomCode}`,
        JSON.stringify(updated),
      );

      // Broadcast updated persona across P2P data channels
      p2pSessionRef.current?.broadcastPersona(updated);

      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
      );
    },
    [currentUser, roomCode],
  );

  const sendReaction = useCallback(
    (targetId: string, type: TableReactionType) => {
      const now = Date.now();
      // Throttle outgoing reaction spam to at most once every 250ms
      if (now - lastReactionTimeRef.current < 250) {
        return;
      }
      lastReactionTimeRef.current = now;

      const payload: TableReactionPayload = {
        id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        targetId,
        type,
        timestamp: Date.now(),
      };

      // Play local sound and queue ephemeral animation
      playReactionSound(type);
      setActiveReactions((prev) => [...prev.slice(-15), payload]);
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== payload.id));
      }, 3000);

      // Broadcast reaction to all connected peers
      broadcast({ type: "THROW_REACTION", payload });
    },
    [currentUser.id, currentUser.name, broadcast],
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
    activeReactions,
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
      sendReaction,
    },
  };
}
