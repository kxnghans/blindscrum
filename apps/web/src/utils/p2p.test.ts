import { describe, it, expect, vi } from "vitest";
import { createP2PSession } from "./p2p";
import type { Participant } from "@/types/scrum";

describe("P2P WebRTC transport module", () => {
  const dummyUser: Participant = {
    id: "user_test_1",
    name: "Tester",
    avatar: "avatar.svg",
    role: "voter",
    hasVoted: false,
    vote: null,
    joinedAt: Date.now(),
  };

  it("should safely return null in non-browser environments (SSR guard)", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR
    delete globalThis.window;

    const session = createP2PSession({
      roomCode: "TEST-123",
      currentUser: dummyUser,
      onEvent: vi.fn(),
      onPeerJoin: vi.fn(),
      onPeerLeave: vi.fn(),
      onPeerPersona: vi.fn(),
    });

    expect(session).toBeNull();
    globalThis.window = originalWindow;
  });

  it("should return null for empty or invalid room codes", () => {
    const session = createP2PSession({
      roomCode: "   ",
      currentUser: dummyUser,
      onEvent: vi.fn(),
      onPeerJoin: vi.fn(),
      onPeerLeave: vi.fn(),
      onPeerPersona: vi.fn(),
    });

    expect(session).toBeNull();
  });
});
