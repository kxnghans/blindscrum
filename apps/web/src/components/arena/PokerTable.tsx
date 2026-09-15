"use client";

/**
 * @file PokerTable.tsx
 * @description Virtual table showing participants, face-down cards during voting,
 * 3D card flips on reveal, and playful real-time interactive throwables/reactions.
 */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Eye,
  RotateCcw,
  ArrowRight,
  Crown,
  Check,
  Clock,
  Smile,
} from "lucide-react";
import type {
  Participant,
  RoundStatus,
  TableReactionType,
  TableReactionPayload,
} from "@/types/scrum";
import { calculateVoteAnalytics } from "@/utils/analytics";

interface PokerTableProps {
  participants: Participant[];
  currentUserId: string;
  roundStatus: RoundStatus;
  isHost: boolean;
  onRevealVotes: () => void;
  onResetRound: () => void;
  onNextStory: () => void;
  hasQueuedStories: boolean;
  activeReactions?: TableReactionPayload[];
  onSendReaction?: (targetId: string, type: TableReactionType) => void;
}

const REACTION_OPTIONS: {
  type: TableReactionType;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  { type: "egg", emoji: "🥚", label: "Egg", desc: "Throw egg & splatter yolk" },
  {
    type: "tomato",
    emoji: "🍅",
    label: "Tomato",
    desc: "Throw juicy squishy tomato",
  },
  {
    type: "gas",
    emoji: "💨",
    label: "Sleep Gas",
    desc: "Spray sleepy mist & Zzz",
  },
  {
    type: "cheers",
    emoji: "🎉",
    label: "Cheers",
    desc: "Celebrate with confetti",
  },
  { type: "zap", emoji: "⚡", label: "Zap", desc: "Shock with lightning bolt" },
];

/**
 * Visual overlay rendering projectile flight and impact splatters for active reactions.
 */
function ReactionOverlay({ reactions }: { reactions: TableReactionPayload[] }) {
  if (reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-visible">
      {reactions.map((r) => {
        return (
          <div
            key={r.id}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* 1. Projectile Flying in from off-screen in smooth arc */}
            <div className="absolute animate-throw-arc text-2xl sm:text-3xl z-40 select-none">
              {r.type === "egg" && "🥚"}
              {r.type === "tomato" && "🍅"}
              {r.type === "gas" && "💨"}
              {r.type === "cheers" && "🎉"}
              {r.type === "zap" && "⚡"}
            </div>

            {/* 2. Impact Splatter / Visual Effect */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              {r.type === "egg" && (
                <div className="w-20 h-24 sm:w-24 sm:h-28 animate-splat-burst flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-md"
                  >
                    {/* Splattered egg white */}
                    <path
                      d="M50 14 C66 10, 88 22, 85 45 C82 60, 94 72, 80 86 C67 98, 42 92, 28 86 C14 80, 6 66, 11 48 C14 32, 30 18, 50 14 Z"
                      fill="#ffffff"
                      fillOpacity="0.88"
                    />
                    {/* Drips */}
                    <path
                      d="M74 76 C76 89, 72 96, 74 99 C77 97, 80 90, 78 78 Z"
                      fill="#ffffff"
                      fillOpacity="0.85"
                    />
                    <path
                      d="M33 80 C30 92, 26 97, 24 99 C26 95, 34 90, 35 80 Z"
                      fill="#ffffff"
                      fillOpacity="0.85"
                    />
                    {/* Golden Yolk */}
                    <ellipse cx="48" cy="50" rx="17" ry="15" fill="#f59e0b" />
                    <ellipse cx="46" cy="48" rx="14" ry="12" fill="#fbbf24" />
                    <ellipse
                      cx="42"
                      cy="43"
                      rx="4.5"
                      ry="3"
                      fill="#ffffff"
                      fillOpacity="0.8"
                    />
                  </svg>
                </div>
              )}

              {r.type === "tomato" && (
                <div className="w-20 h-24 sm:w-24 sm:h-28 animate-splat-burst flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-md"
                  >
                    {/* Tomato splatter pool */}
                    <path
                      d="M50 16 C70 8, 90 26, 86 48 C83 63, 95 76, 80 90 C66 100, 38 94, 26 86 C12 78, 5 62, 11 43 C17 24, 30 20, 50 16 Z"
                      fill="#dc2626"
                    />
                    <path
                      d="M48 22 C64 16, 80 30, 76 47 C73 58, 83 69, 72 81 C60 89, 36 84, 28 77 C17 71, 13 56, 17 41 C21 26, 33 24, 48 22 Z"
                      fill="#ef4444"
                    />
                    {/* Seeds */}
                    <ellipse cx="40" cy="45" rx="3" ry="2" fill="#fef08a" />
                    <ellipse cx="58" cy="53" rx="2.8" ry="1.8" fill="#fef08a" />
                    <ellipse cx="49" cy="67" rx="2.9" ry="1.9" fill="#fef08a" />
                    {/* Drips */}
                    <path
                      d="M78 82 C80 93, 76 98, 74 100 C77 96, 82 89, 80 81 Z"
                      fill="#dc2626"
                    />
                    <path
                      d="M28 84 C26 94, 22 99, 20 100 C22 96, 30 91, 30 83 Z"
                      fill="#dc2626"
                    />
                  </svg>
                </div>
              )}

              {r.type === "gas" && (
                <div className="relative w-full h-full flex flex-col items-center justify-center overflow-visible">
                  {/* Misty Cloud */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/50 via-teal-400/35 to-indigo-500/25 backdrop-blur-[2px] rounded-2xl animate-gas-mist" />
                  {/* Floating Zzz */}
                  <div className="absolute -top-6 right-2 text-indigo-300 font-black text-xl animate-zzz-drift select-none">
                    Z
                  </div>
                  <div
                    className="absolute -top-2 right-5 text-purple-300 font-bold text-base animate-zzz-drift select-none"
                    style={{ animationDelay: "200ms" }}
                  >
                    z
                  </div>
                  <div
                    className="absolute top-2 right-8 text-teal-200 font-semibold text-xs animate-zzz-drift select-none"
                    style={{ animationDelay: "400ms" }}
                  >
                    z
                  </div>
                </div>
              )}

              {r.type === "cheers" && (
                <div className="relative w-full h-full flex items-center justify-center animate-cheers-burst overflow-visible select-none">
                  <div className="text-3xl animate-bounce">🎉</div>
                  <div className="absolute -top-3 -left-2 text-base">✨</div>
                  <div className="absolute -top-5 right-1 text-base">🌟</div>
                  <div className="absolute bottom-1 -right-3 text-base">🎊</div>
                  <div className="absolute bottom-3 -left-3 text-base">🎈</div>
                </div>
              )}

              {r.type === "zap" && (
                <div className="relative w-full h-full flex items-center justify-center animate-zap-flash overflow-visible select-none">
                  <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(250,204,21,0.95)]">
                    ⚡
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 bg-yellow-400/20 animate-pulse" />
                </div>
              )}
            </div>

            {/* 3. Ephemeral Sender Attribution Badge */}
            <div className="absolute -top-7 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-900/90 dark:bg-slate-950/95 text-white text-[10px] font-bold border border-slate-700 shadow-lg animate-in fade-in zoom-in-95 duration-150 z-50">
              {r.type === "egg" && `🥚 ${r.senderName} egged!`}
              {r.type === "tomato" && `🍅 ${r.senderName} tomatoed!`}
              {r.type === "gas" && `💨 ${r.senderName} gassed!`}
              {r.type === "cheers" && `🎉 ${r.senderName} cheered!`}
              {r.type === "zap" && `⚡ ${r.senderName} zapped!`}
            </div>
          </div>
        );
      })}
    </div>
  );
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
  activeReactions = [],
  onSendReaction,
}: PokerTableProps) {
  const isRevealed = roundStatus === "REVEALED";
  const votedCount = participants.filter((p) => p.hasVoted).length;
  const totalCount = participants.length;
  const pendingParticipants = participants.filter((p) => !p.hasVoted);

  // Compute live estimation analytics for post-reveal highlights & summaries
  const votesList = participants.map((p) => p.vote);
  const analytics = calculateVoteAnalytics(votesList);

  // Reaction popover target participant ID
  const [activePickerTargetId, setActivePickerTargetId] = useState<
    string | null
  >(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Dismiss reaction picker on click outside or Escape key
  useEffect(() => {
    if (!activePickerTargetId) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setActivePickerTargetId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePickerTargetId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePickerTargetId]);

  return (
    <div className="w-full max-w-5xl mx-auto my-4 sm:my-6 px-4">
      {/* Table surface */}
      <div className="relative rounded-3xl p-4 sm:p-6 md:p-8 bg-gradient-to-b from-slate-100/90 to-slate-200/90 dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-300/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Center status & host actions: compact, cohesive bar */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mb-4 sm:mb-6">
          {isRevealed ? (
            /* Post-reveal compact action bar: Status pill & action buttons aligned side-by-side */
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span>Votes revealed</span>
              </div>

              {isHost ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onResetRound}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revote</span>
                  </button>

                  {hasQueuedStories && (
                    <button
                      type="button"
                      onClick={onNextStory}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Next Project</span>
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Waiting for host to restart or move to next project.
                </span>
              )}
            </div>
          ) : (
            /* Voting in progress bar */
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    votedCount === totalCount && totalCount > 0
                      ? "bg-emerald-500 animate-ping"
                      : "bg-amber-500 animate-pulse"
                  }`}
                />
                <span>
                  {votedCount === totalCount && totalCount > 0
                    ? "All teammates have voted!"
                    : `${votedCount} of ${totalCount} teammates voted`}
                </span>
              </div>

              {/* Pending voter roster */}
              {pendingParticipants.length > 0 && totalCount > 1 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Waiting on:{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {pendingParticipants
                      .map((p) => (p.id === currentUserId ? "You" : p.name))
                      .join(", ")}
                  </span>
                </p>
              )}

              {/* Host reveal action */}
              {isHost ? (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onRevealVotes}
                    disabled={votedCount === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Eye className="w-4 h-4" />
                    <span>
                      Reveal Votes ({votedCount}/{totalCount})
                    </span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Waiting for host to flip cards...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Participants grid: Avatar-on-Card Poker Table Architecture */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
          {participants.map((participant) => {
            const isSelf = participant.id === currentUserId;
            const hasVoted = participant.hasVoted;
            const participantReactions = activeReactions.filter(
              (r) => r.targetId === participant.id,
            );
            const isTargeted = participantReactions.length > 0;
            const isPickerOpen = activePickerTargetId === participant.id;

            const isTiedVote =
              participant.vote !== null &&
              analytics.isTie &&
              analytics.modes.includes(participant.vote);

            const isSingleClearMajority =
              participant.vote !== null &&
              !analytics.isTie &&
              analytics.mode !== null &&
              participant.vote === analytics.mode;

            const isConsensusWinner =
              isSingleClearMajority && analytics.hasConsensus;

            return (
              <div
                key={participant.id}
                className="relative flex flex-col items-center gap-2 group"
              >
                {/* Reaction Picker Popover (shown when clicking a guest) */}
                {isPickerOpen && (
                  <div
                    ref={pickerRef}
                    className="absolute -top-16 z-50 flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {REACTION_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          onSendReaction?.(participant.id, opt.type);
                          setActivePickerTargetId(null);
                        }}
                        title={`${opt.label}: ${opt.desc}`}
                        aria-label={`Send ${opt.label} to ${participant.name}`}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-slate-800 hover:scale-125 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <span>{opt.emoji}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Container with 3D Flip Perspective */}
                <div
                  onClick={() => {
                    if (!isSelf) {
                      setActivePickerTargetId((prev) =>
                        prev === participant.id ? null : participant.id,
                      );
                    }
                  }}
                  className={`perspective-1000 w-24 h-36 sm:w-28 sm:h-40 md:w-32 md:h-44 relative select-none ${
                    !isSelf ? "cursor-pointer" : ""
                  } ${isTargeted ? "animate-card-shake" : ""}`}
                  title={
                    !isSelf
                      ? `Click to throw a reaction at ${participant.name}`
                      : undefined
                  }
                >
                  {/* Flipping 3D Card */}
                  <div
                    className={`relative w-full h-full rounded-2xl transition-transform duration-700 preserve-3d shadow-md ${
                      isRevealed ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front Face: Masked / In-Progress Voting */}
                    <div
                      className={`absolute inset-0 backface-hidden rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between border transition-all ${
                        hasVoted
                          ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/25"
                          : "bg-white/90 dark:bg-slate-800/90 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 shadow-sm"
                      }`}
                    >
                      {/* Top Front Header: Role Crown or Self Badge */}
                      <div className="w-full flex items-center justify-between text-[10px] font-bold">
                        {participant.role === "host" ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40"
                            title="Room Host"
                          >
                            <Crown className="w-2.5 h-2.5" />
                            <span>Host</span>
                          </span>
                        ) : (
                          <span className="w-2.5 h-2.5" />
                        )}

                        {isSelf && (
                          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>

                      {/* Center Front: Avatar & Participant Name */}
                      <div className="flex flex-col items-center text-center my-auto min-w-0 w-full">
                        <div
                          className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all shadow-sm ${
                            hasVoted
                              ? "ring-2 ring-emerald-400 shadow-md shadow-emerald-400/30"
                              : "ring-2 ring-amber-400/60 dark:ring-amber-500/40 animate-pulse"
                          }`}
                        >
                          <Image
                            src={participant.avatar}
                            alt={participant.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          {hasVoted && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm"
                              title="Voted"
                            >
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <span
                          className={`mt-1.5 text-xs font-bold truncate max-w-[95%] ${
                            hasVoted
                              ? "text-white"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {participant.name}
                        </span>
                      </div>

                      {/* Bottom Front: Dynamic Voting Status Pill */}
                      <div className="w-full flex justify-center">
                        {hasVoted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>
                              {isSelf && participant.vote !== null
                                ? `${participant.vote} pts`
                                : "Voted"}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                            <Clock className="w-2.5 h-2.5 animate-spin text-amber-500" />
                            <span>Voting...</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Back Face: Revealed Value + Anchored Top Avatar & Summary */}
                    <div
                      className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white dark:bg-slate-900 flex flex-col items-center justify-between p-2 sm:p-2.5 shadow-xl transition-all ${
                        isConsensusWinner
                          ? "border-2 border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/20"
                          : isTiedVote
                            ? "border-2 border-amber-500/80 shadow-amber-500/20 ring-2 ring-amber-500/20"
                            : "border-2 border-indigo-500/70 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {/* Top Back: Anchored Participant Avatar & Alias Header */}
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 max-w-[96%]">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={participant.avatar}
                            alt={participant.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                          {participant.name}
                        </span>
                        {participant.role === "host" && (
                          <Crown className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                        )}
                      </div>

                      {/* Center Back: Giant Numeric Estimate Value */}
                      <div className="flex flex-col items-center justify-center my-auto">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                          {participant.vote ?? "-"}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 -mt-0.5">
                          pts
                        </span>
                      </div>

                      {/* Bottom Back: Summary Pill */}
                      <div className="w-full flex justify-center">
                        {isConsensusWinner ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-sm">
                            ★ Consensus
                          </span>
                        ) : isSingleClearMajority ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-sm">
                            ★ Majority
                          </span>
                        ) : isTiedVote ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shadow-sm">
                            Split ({analytics.modeCount} votes)
                          </span>
                        ) : analytics.spread !== null &&
                          analytics.spread > 0 &&
                          participant.vote === analytics.min ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-800/50">
                            Lowest
                          </span>
                        ) : analytics.spread !== null &&
                          analytics.spread > 0 &&
                          participant.vote === analytics.max ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/50 dark:border-amber-800/50">
                            Highest
                          </span>
                        ) : participant.vote === null ? (
                          <span className="text-[9px] font-medium text-slate-400">
                            No vote
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                            Estimated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Reactions overlay (Splatter, Gas, Zap, Cheers) */}
                  <ReactionOverlay reactions={participantReactions} />
                </div>

                {/* Footer Action: React Trigger or You Tag */}
                <div className="flex items-center justify-center">
                  {!isSelf ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePickerTargetId((prev) =>
                          prev === participant.id ? null : participant.id,
                        );
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-70 hover:opacity-100 transition-opacity"
                      aria-label={`React to ${participant.name}`}
                    >
                      <Smile className="w-3 h-3" />
                      <span>React</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      You
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
