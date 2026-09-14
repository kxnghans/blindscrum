import { describe, it, expect } from "vitest";
import { calculateVoteAnalytics } from "./analytics";
import type { FibonacciValue } from "@/types/scrum";

describe("calculateVoteAnalytics", () => {
  it("should return zeros and nulls for empty votes array", () => {
    const result = calculateVoteAnalytics([]);
    expect(result.totalVotes).toBe(0);
    expect(result.average).toBeNull();
    expect(result.mode).toBeNull();
    expect(result.spread).toBeNull();
    expect(result.hasConsensus).toBe(false);
  });

  it("should calculate correct average, mode, and spread for numeric votes", () => {
    const votes: FibonacciValue[] = [3, 5, 5, 8];
    const result = calculateVoteAnalytics(votes);

    expect(result.totalVotes).toBe(4);
    // (3 + 5 + 5 + 8) / 4 = 21 / 4 = 5.25 -> 5.3 rounded
    expect(result.average).toBe(5.3);
    expect(result.mode).toBe(5);
    expect(result.modeCount).toBe(2);
    expect(result.modePercentage).toBe(50);
    expect(result.min).toBe(3);
    expect(result.max).toBe(8);
    expect(result.spread).toBe(5);
  });

  it("should flag high consensus when >= 70% of team votes the same", () => {
    const votes: FibonacciValue[] = [5, 5, 5, 8];
    const result = calculateVoteAnalytics(votes);

    expect(result.mode).toBe(5);
    expect(result.modeCount).toBe(3);
    expect(result.modePercentage).toBe(75);
    expect(result.hasConsensus).toBe(true);
  });

  it("should correctly handle non-numeric votes like ? and ☕", () => {
    const votes: FibonacciValue[] = [5, 5, "?", "☕"];
    const result = calculateVoteAnalytics(votes);

    expect(result.totalVotes).toBe(4);
    // (5 + 5) / 2 = 5
    expect(result.average).toBe(5);
    expect(result.mode).toBe(5);
    expect(result.distribution.some((d) => d.value === "?" && d.count === 1)).toBe(true);
    expect(result.distribution.some((d) => d.value === "☕" && d.count === 1)).toBe(true);
  });
});
