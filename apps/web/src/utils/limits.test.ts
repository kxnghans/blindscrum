import { describe, it, expect } from "vitest";
import {
  MAX_STORY_TITLE_LENGTH,
  MAX_PERSONA_NAME_LENGTH,
  MAX_ROOM_CODE_LENGTH,
} from "@/types/scrum";
import { isValidRoomCode, normalizeRoomCode } from "./roomCode";

describe("Smart input limits and boundary enforcement", () => {
  it("should have expected centralized boundary values", () => {
    expect(MAX_STORY_TITLE_LENGTH).toBe(300);
    expect(MAX_PERSONA_NAME_LENGTH).toBe(28);
    expect(MAX_ROOM_CODE_LENGTH).toBe(16);
  });

  it("should truncate oversized story titles to MAX_STORY_TITLE_LENGTH (300)", () => {
    const longStory = "A".repeat(450);
    const sanitized = longStory.slice(0, MAX_STORY_TITLE_LENGTH);
    expect(sanitized.length).toBe(300);
  });

  it("should truncate oversized persona names to MAX_PERSONA_NAME_LENGTH (28)", () => {
    const longName = "Velocity Falcon of the Great Northern Agile Mountains";
    const sanitized = longName.slice(0, MAX_PERSONA_NAME_LENGTH);
    expect(sanitized.length).toBe(28);
  });

  it("should enforce room code maximum length of 16 characters", () => {
    const valid16 = "A".repeat(16);
    expect(isValidRoomCode(valid16)).toBe(true);

    const invalid17 = "A".repeat(17);
    expect(isValidRoomCode(invalid17)).toBe(false);

    const normalized = normalizeRoomCode(" SCRUM-492-TEAM-A-123456789 ");
    expect(normalized.length).toBeGreaterThan(16);
    expect(isValidRoomCode(normalized)).toBe(false);
  });
});
