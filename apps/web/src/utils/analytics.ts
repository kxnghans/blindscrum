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

type NumericCard = (typeof FIBONACCI_CARDS)[number];

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

  // Extract numeric votes for mean, min, max, spread calculation
  const numericVotes: number[] = activeVotes.filter(
    (v): v is NumericCard => typeof v === "number",
  );

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

  // Mode (most frequent vote)
  let mode: FibonacciValue | null = null;
  let modeCount = 0;
  for (const [val, count] of counts.entries()) {
    if (count > modeCount) {
      mode = val;
      modeCount = count;
    }
  }

  const modePercentage =
    activeVotes.length > 0
      ? Math.round((modeCount / activeVotes.length) * 100)
      : 0;

  // Has consensus if >= 70% of voters agreed on the mode and at least 2 people voted
  const hasConsensus = modePercentage >= 70 && activeVotes.length >= 2;

  // Distribution across known Fibonacci cards + special options
  const distribution: VoteDistributionItem[] = [];
  const knownCards: FibonacciValue[] = [...FIBONACCI_CARDS, "?", "☕"];

  for (const card of knownCards) {
    const count = counts.get(card) ?? 0;
    if (count > 0 || (typeof card === "number" && numericVotes.length > 0)) {
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
    modeCount,
    modePercentage,
    min,
    max,
    spread,
    distribution,
    hasConsensus,
  };
}
