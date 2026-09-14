/**
 * @file analytics.ts
 * @description Pure calculation functions for scrum estimation analytics.
 * Computes arithmetic mean, mode/majority consensus, min/max divergence spread, and distribution.
 */

import {
  type FibonacciValue,
  type VoteAnalytics,
  type VoteDistributionItem,
  FIBONACCI_CARDS,
} from "@/types/scrum";

/**
 * Calculates complete estimation analytics from an array of revealed votes.
 */
export function calculateVoteAnalytics(
  votes: Array<FibonacciValue | null | undefined>,
): VoteAnalytics {
  // Filter out null, undefined, or empty votes
  const activeVotes = votes.filter(
    (v): v is FibonacciValue => v !== null && v !== undefined,
  );

  if (activeVotes.length === 0) {
    return {
      totalVotes: 0,
      average: null,
      mode: null,
      modes: [],
      isTie: false,
      modeCount: 0,
      modePercentage: 0,
      min: null,
      max: null,
      spread: null,
      distribution: [],
      hasConsensus: false,
    };
  }

  // Count occurrences of each voted option
  const counts = new Map<FibonacciValue, number>();
  for (const vote of activeVotes) {
    counts.set(vote, (counts.get(vote) ?? 0) + 1);
  }

  // Calculate mean, min, max, spread across all numeric votes
  const numericVotes: number[] = activeVotes;

  let average: number | null = null;
  let min: number | null = null;
  let max: number | null = null;
  let spread: number | null = null;

  if (numericVotes.length > 0) {
    const sum = numericVotes.reduce((acc, curr) => acc + curr, 0);
    average = Math.round((sum / numericVotes.length) * 10) / 10;
    min = Math.min(...numericVotes);
    max = Math.max(...numericVotes);
    spread = max - min;
  }

  // Find highest frequency count
  let maxCount = 0;
  for (const count of counts.values()) {
    if (count > maxCount) {
      maxCount = count;
    }
  }

  // Collect all values matching the maximum count (handles ties / bimodal distributions)
  const modes: FibonacciValue[] = [];
  for (const [val, count] of counts.entries()) {
    if (count === maxCount) {
      modes.push(val);
    }
  }
  modes.sort((a, b) => a - b);

  const isTie = modes.length > 1;
  const mode = modes[0] ?? null;
  const modeCount = maxCount;
  const modePercentage =
    activeVotes.length > 0
      ? Math.round((modeCount / activeVotes.length) * 100)
      : 0;

  // Has consensus only if a single clear mode, >= 70% agreement, and at least 2 voters
  const hasConsensus = !isTie && modePercentage >= 70 && activeVotes.length >= 2;

  // Distribution across known Fibonacci cards
  const distribution: VoteDistributionItem[] = [];
  const knownCards: readonly FibonacciValue[] = FIBONACCI_CARDS;

  for (const card of knownCards) {
    const count = counts.get(card) ?? 0;
    if (count > 0 || numericVotes.length > 0) {
      distribution.push({
        value: card,
        count,
        percentage:
          activeVotes.length > 0
            ? Math.round((count / activeVotes.length) * 100)
            : 0,
      });
    }
  }

  return {
    totalVotes: activeVotes.length,
    average,
    mode,
    modes,
    isTie,
    modeCount,
    modePercentage,
    min,
    max,
    spread,
    distribution,
    hasConsensus,
  };
}
