/**
 * @file p2p.ts
 * @description Serverless WebRTC peer-to-peer transport for BlindScrum using Trystero.
 * Provides ephemeral data channels with zero server persistence and zero accounts.
 */

import { joinRoom, type Room } from "trystero";
import type { Participant, ScrumBroadcastEvent } from "@/types/scrum";

export interface P2PSessionOptions {
  roomCode: string;
  currentUser: Participant;
  onEvent: (event: ScrumBroadcastEvent, peerId: string) => void;
  onPeerJoin: (peerId: string) => void;
  onPeerLeave: (peerId: string) => void;
  onPeerPersona: (peerId: string, participant: Participant) => void;
}

export interface P2PSession {
  broadcast: (event: ScrumBroadcastEvent) => Promise<void>;
  sendToPeer: (peerId: string, event: ScrumBroadcastEvent) => Promise<void>;
  broadcastPersona: (participant: Participant) => Promise<void>;
  sendPersonaToPeer: (
    peerId: string,
    participant: Participant,
  ) => Promise<void>;
  destroy: () => Promise<void>;
}

const APP_ID = "blindscrum-p2p-v1";

/**
 * Creates and initializes an ephemeral WebRTC P2P room.
 */
export function createP2PSession({
  roomCode,
  currentUser,
  onEvent,
  onPeerJoin,
  onPeerLeave,
  onPeerPersona,
}: P2PSessionOptions): P2PSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Sanitize room code for topic identification
  const normalizedRoom = roomCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  if (!normalizedRoom) {
    return null;
  }

  const room: Room = joinRoom(
    {
      appId: APP_ID,
      rtcConfig: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      },
    },
    normalizedRoom,
  );

  // Define string-based actions to ensure reliable JSON serialization
  const scrumAction = room.makeAction<string>("scrum_event");
  const personaAction = room.makeAction<string>("scrum_persona");

  // Listen for broadcast events from any peer
  scrumAction.onMessage = (rawJson, context) => {
    try {
      const parsed = JSON.parse(rawJson) as ScrumBroadcastEvent;
      if (parsed && parsed.type) {
        onEvent(parsed, context.peerId);
      }
    } catch {
      // Ignore malformed payloads
    }
  };

  // Listen for peer persona declarations
  personaAction.onMessage = (rawJson, context) => {
    try {
      const parsed = JSON.parse(rawJson) as Participant;
      if (parsed && parsed.id) {
        onPeerPersona(context.peerId, parsed);
      }
    } catch {
      // Ignore malformed payloads
    }
  };

  // Handle peer presence lifecycle
  room.onPeerJoin = (peerId) => {
    onPeerJoin(peerId);
    // Announce our identity directly to the newly connected peer
    personaAction
      .send(JSON.stringify(currentUser), { target: peerId })
      .catch(() => {
        // Channel send error handled gracefully
      });
  };

  room.onPeerLeave = (peerId) => {
    onPeerLeave(peerId);
  };

  return {
    broadcast: async (event: ScrumBroadcastEvent) => {
      try {
        await scrumAction.send(JSON.stringify(event));
      } catch {
        // Suppress transient disconnect errors
      }
    },
    sendToPeer: async (peerId: string, event: ScrumBroadcastEvent) => {
      try {
        await scrumAction.send(JSON.stringify(event), { target: peerId });
      } catch {
        // Suppress transient disconnect errors
      }
    },
    broadcastPersona: async (participant: Participant) => {
      try {
        await personaAction.send(JSON.stringify(participant));
      } catch {
        // Suppress transient disconnect errors
      }
    },
    sendPersonaToPeer: async (peerId: string, participant: Participant) => {
      try {
        await personaAction.send(JSON.stringify(participant), {
          target: peerId,
        });
      } catch {
        // Suppress transient disconnect errors
      }
    },
    destroy: async () => {
      try {
        await room.leave();
      } catch {
        // Clean disconnect
      }
    },
  };
}
