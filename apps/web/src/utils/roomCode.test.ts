import { describe, it, expect } from "vitest";
import {
  generateRoomCode,
  normalizeRoomCode,
  isValidRoomCode,
} from "./roomCode";

describe("roomCode utilities", () => {
  it("should generate room codes in PREFIX-NUMBER format", () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[A-Z]+-\d{3}$/);
  });

  it("should normalize raw input by trimming, uppercase, and removing invalid characters", () => {
    expect(normalizeRoomCode(" scrum-492 ")).toBe("SCRUM-492");
    expect(normalizeRoomCode("blnd#82!")).toBe("BLND82");
  });

  it("should accurately validate acceptable room code formats", () => {
    expect(isValidRoomCode("SCRUM-100")).toBe(true);
    expect(isValidRoomCode("A")).toBe(false);
    expect(isValidRoomCode("VERY-LONG-INVALID-CODE-BEYOND-LIMIT")).toBe(false);
  });
});
