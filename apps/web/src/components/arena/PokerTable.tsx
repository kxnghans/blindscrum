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
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
      {/* Table surface */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-slate-100/90 to-slate-200/90 dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-300/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Center status & host actions */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isRevealed
                  ? "bg-emerald-500"
                  : votedCount === totalCount && totalCount > 0
                    ? "bg-emerald-500 animate-ping"
                    : "bg-amber-500 animate-pulse"
              }`}
            />
            <span>
              {isRevealed
                ? "Votes revealed"
                : votedCount === totalCount && totalCount > 0
                  ? "All teammates have voted!"
                  : `${votedCount} of ${totalCount} teammates voted`}
            </span>
          </div>

          {/* Pending voter roster */}
          {!isRevealed && pendingParticipants.length > 0 && totalCount > 1 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 max-w-md mx-auto">
              Waiting on:{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {pendingParticipants
                  .map((p) => (p.id === currentUserId ? "You" : p.name))
                  .join(", ")}
              </span>
            </p>
          )}

          {/* Host actions */}
          {isHost ? (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
            const participantReactions = activeReactions.filter(
              (r) => r.targetId === participant.id,
            );
            const isTargeted = participantReactions.length > 0;
            const isPickerOpen = activePickerTargetId === participant.id;

            return (
              <div
                key={participant.id}
                className="relative flex flex-col items-center gap-2.5 group"
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

                {/* Card Container */}
                <div
                  onClick={() => {
                    if (!isSelf) {
                      setActivePickerTargetId((prev) =>
                        prev === participant.id ? null : participant.id,
                      );
                    }
                  }}
                  className={`perspective-1000 w-16 h-24 sm:w-20 sm:h-28 relative ${
                    !isSelf ? "cursor-pointer" : ""
                  }`}
                  title={
                    !isSelf
                      ? `Click to throw a reaction at ${participant.name}`
                      : undefined
                  }
                >
                  <div
                    className={`relative w-full h-full rounded-2xl transition-transform duration-500 preserve-3d shadow-md ${
                      isRevealed ? "rotate-y-180" : ""
                    } ${isTargeted ? "animate-card-shake" : ""}`}
                  >
                    {/* Front: Masked */}
                    <div
                      className={`absolute inset-0 backface-hidden rounded-2xl p-1.5 flex flex-col items-center justify-center border transition-all ${
                        hasVoted
                          ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 border-indigo-400/50 text-white shadow-indigo-500/30 scale-[1.02]"
                          : "bg-slate-200/80 dark:bg-slate-800/80 border-dashed border-slate-300 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      {hasVoted ? (
                        <div className="flex flex-col items-center gap-1.5 text-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-100">
                            {isSelf && participant.vote !== null
                              ? `${participant.vote} pts`
                              : "Voted"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-center opacity-65">
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
                        {participant.vote ?? "-"}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        pts
                      </span>
                    </div>
                  </div>

                  {/* Active Reactions overlay (Splatter, Gas, Zap, Cheers) */}
                  <ReactionOverlay reactions={participantReactions} />
                </div>

                {/* Participant badge with dynamic status ring */}
                <div className="flex flex-col items-center text-center">
                  <div
                    onClick={() => {
                      if (!isSelf) {
                        setActivePickerTargetId((prev) =>
                          prev === participant.id ? null : participant.id,
                        );
                      }
                    }}
                    className={`relative ${!isSelf ? "cursor-pointer" : ""}`}
                    title={
                      !isSelf
                        ? `Click to react to ${participant.name}`
                        : undefined
                    }
                  >
                    <div
                      className={`relative w-8 h-8 rounded-full overflow-hidden transition-all ${
                        hasVoted
                          ? "ring-2 ring-emerald-500 shadow-md shadow-emerald-500/30"
                          : !isRevealed
                            ? "ring-1 ring-amber-400/60 dark:ring-amber-500/40 animate-pulse"
                            : "border-2 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <Image
                        src={participant.avatar}
                        alt={participant.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Voted checkmark badge */}
                    {hasVoted && (
                      <span
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm"
                        title="Voted"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Host crown */}
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

                  {/* Subtle reaction hint trigger for non-self seats */}
                  {!isSelf && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePickerTargetId((prev) =>
                          prev === participant.id ? null : participant.id,
                        );
                      }}
                      className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`React to ${participant.name}`}
                    >
                      <Smile className="w-3 h-3" />
                      <span>React</span>
                    </button>
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
