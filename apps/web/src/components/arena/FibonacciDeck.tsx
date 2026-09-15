"use client";

/**
 * @file FibonacciDeck.tsx
 * @description Interactive Fibonacci poker cards with keyboard navigation and click feedback.
 */

import {
  FIBONACCI_CARDS,
  type FibonacciValue,
  type RoundStatus,
} from "@/types/scrum";

interface FibonacciDeckProps {
  selectedVote: FibonacciValue | null;
  roundStatus: RoundStatus;
  onSelectVote: (value: FibonacciValue) => void;
}

export function FibonacciDeck({
  selectedVote,
  roundStatus,
  onSelectVote,
}: FibonacciDeckProps) {
  const cards = FIBONACCI_CARDS;
  const isRevealed = roundStatus === "REVEALED";

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="text-center mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {isRevealed
            ? "Votes revealed"
            : selectedVote !== null
              ? "Card locked (click another to change)"
              : "Pick your estimate"}
        </p>
      </div>

      {/* Cards list */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
        {cards.map((val) => {
          const isSelected = selectedVote === val;

          return (
            <button
              key={val}
              type="button"
              disabled={isRevealed}
              onClick={() => onSelectVote(val)}
              className={`group relative flex flex-col items-center justify-between w-14 h-22 sm:w-18 sm:h-28 rounded-2xl p-2 transition-all duration-200 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 ${
                isSelected
                  ? "-translate-y-3 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/35 ring-4 ring-indigo-400/40"
                  : isRevealed
                    ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400"
                    : "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 hover:-translate-y-2 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/15"
              }`}
              aria-pressed={isSelected}
              aria-label={`Estimate ${val} project points`}
            >
              {/* Corner Value Mini */}
              <span
                className={`self-start text-[10px] sm:text-xs font-mono font-bold ${
                  isSelected
                    ? "text-indigo-200"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {val}
              </span>

              {/* Center Value */}
              <span
                className={`text-xl sm:text-3xl font-extrabold tracking-tight my-auto ${
                  isSelected
                    ? "text-white scale-110"
                    : "text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                } transition-all`}
              >
                {val}
              </span>

              {/* Inverted Corner Value */}
              <span
                className={`self-end text-[10px] sm:text-xs font-mono font-bold rotate-180 ${
                  isSelected
                    ? "text-indigo-200"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {val}
              </span>

              {/* Pip */}
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
