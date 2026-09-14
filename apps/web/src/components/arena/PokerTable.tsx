"use client";

/**
 * @file PokerTable.tsx
 * @description Virtual table showing participants, face-down cards during voting,
 * and 3D card flips when the host reveals.
 */

import Image from "next/image";
import { Eye, RotateCcw, ArrowRight, Crown, Check, Clock } from "lucide-react";
import type { Participant, RoundStatus } from "@/types/scrum";

interface PokerTableProps {
  participants: Participant[];
  currentUserId: string;
  roundStatus: RoundStatus;
  isHost: boolean;
  onRevealVotes: () => void;
  onResetRound: () => void;
  onNextStory: () => void;
  hasQueuedStories: boolean;
}

export function PokerTable({
  participants,
  currentUserId,
  roundStatus,
  isHost,
  onRevealVotes,
  onResetRound,
  onNextStory,
  hasQueuedStories,
}: PokerTableProps) {
  const isRevealed = roundStatus === "REVEALED";
  const votedCount = participants.filter((p) => p.hasVoted).length;
  const totalCount = participants.length;

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
      {/* Table surface */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-slate-100/90 to-slate-200/90 dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-300/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Center status & host actions */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-4 shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isRevealed ? "bg-emerald-500" : votedCount === totalCount ? "bg-indigo-500 animate-ping" : "bg-amber-500 animate-pulse"
              }`}
            />
            {isRevealed
              ? "Votes revealed"
              : `${votedCount} of ${totalCount} teammates voted`}
          </div>

          {/* Host actions */}
          {isHost ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRevealed ? (
                <button
                  type="button"
                  onClick={onRevealVotes}
                  disabled={votedCount === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50"
                >
                  <Eye className="w-4 h-4" />
                  Reveal Votes ({votedCount}/{totalCount})
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onResetRound}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold border border-slate-300 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Revote
                  </button>

                  {hasQueuedStories && (
                    <button
                      type="button"
                      onClick={onNextStory}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Next Story
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRevealed
                ? "Waiting for the host to restart or move to the next ticket."
                : "Waiting for the host to flip cards..."}
            </p>
          )}
        </div>

        {/* Participants grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
          {participants.map((participant) => {
            const isSelf = participant.id === currentUserId;
            const hasVoted = participant.hasVoted;

            return (
              <div
                key={participant.id}
                className="flex flex-col items-center gap-2.5"
              >
                {/* Card */}
                <div className="perspective-1000 w-16 h-24 sm:w-20 sm:h-28">
                  <div
                    className={`relative w-full h-full rounded-2xl transition-transform duration-500 preserve-3d shadow-md ${
                      isRevealed ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front: Masked */}
                    <div
                      className={`absolute inset-0 backface-hidden rounded-2xl p-1.5 flex flex-col items-center justify-center border transition-all ${
                        hasVoted
                          ? "bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-400/50 text-white shadow-indigo-500/30"
                          : "bg-slate-200/80 dark:bg-slate-800/80 border-dashed border-slate-300 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      {hasVoted ? (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <Check className="w-5 h-5 text-emerald-300 animate-bounce" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                            {isSelf && participant.vote !== null ? participant.vote : "Voted"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center opacity-60">
                          <Clock className="w-4 h-4 animate-spin text-slate-400" />
                          <span className="text-[9px] font-semibold uppercase tracking-wider">
                            Voting...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Back: Revealed Value */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center p-2 shadow-xl">
                      <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        {participant.vote ?? "?"}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Participant badge */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-sm">
                      <Image
                        src={participant.avatar}
                        alt={participant.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    {participant.role === "host" && (
                      <span
                        className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm"
                        title="Room Host"
                      >
                        <Crown className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <span className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                    {participant.name} {isSelf && "(You)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
