"use client";

/**
 * @file StoryPipeline.tsx
 * @description In-flow pipeline showing what the team is sizing, what is up next,
 * and an inline queue input usable by any participant.
 */

import { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Plus,
  Play,
  Layers,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import type { StoryQueueItem } from "@/types/scrum";

interface StoryPipelineProps {
  currentTitle: string;
  isHost: boolean;
  queue: StoryQueueItem[];
  onUpdateTitle: (title: string) => void;
  onAddToQueue: (title: string) => void;
  onPromoteStory?: (item: StoryQueueItem) => void;
  onOpenFullQueue: () => void;
}

export function StoryPipeline({
  currentTitle,
  isHost,
  queue,
  onUpdateTitle,
  onAddToQueue,
  onPromoteStory,
  onOpenFullQueue,
}: StoryPipelineProps) {
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [currentInputValue, setCurrentInputValue] = useState(currentTitle);
  const [prevTitle, setPrevTitle] = useState(currentTitle);

  // Quick-add input state for inline queueing (usable by any participant)
  const [quickQueueText, setQuickQueueText] = useState("");

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const micRef = useRef<HTMLButtonElement | null>(null);

  // Sync incoming title changes from remote host
  if (currentTitle !== prevTitle) {
    setPrevTitle(currentTitle);
    if (!isEditingCurrent) {
      setCurrentInputValue(currentTitle);
    }
  }

  // Speech-to-text hook for voice ticket dictation
  const { isMicActive, showVisualCues, toggleMic } = useVoiceSearch({
    onTranscript: (transcript) => {
      setCurrentInputValue(transcript);
      if (isHost) {
        onUpdateTitle(transcript);
      }
    },
    inputRef: titleInputRef,
    micRef,
  });

  const handleCommitCurrentTitle = () => {
    if (!currentInputValue.trim()) {
      toast.error("Story title cannot be empty.");
      return;
    }
    onUpdateTitle(currentInputValue.trim());
    setIsEditingCurrent(false);
    toast.success("Active story updated.");
  };

  const handleQuickAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const form = e?.target as HTMLFormElement | undefined;
    const formVal = form ? (new FormData(form).get("quickQueue") as string | null) : null;
    const trimmed = (formVal ?? quickQueueText).trim();
    if (!trimmed) {
      toast.error("Type a ticket title to queue.");
      return;
    }
    onAddToQueue(trimmed);
    setQuickQueueText("");
    toast.success("Added to queue.", {
      description: `"${trimmed.slice(0, 40)}${trimmed.length > 40 ? "..." : ""}"`,
    });
  };

  const upNextItem = queue[0] ?? null;
  const remainingBacklog = queue.slice(1);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-4 space-y-3">
      {/* Top Banner: Active Story + Voice Mic & Inline Queue */}
      <div className="relative rounded-3xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all">
        {/* Header Row: Stage Indicator & Voice Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Now Sizing
            </span>

            {/* Listening Voice Indicator */}
            {showVisualCues && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Listening...
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            {isHost ? "Host can edit or speak ticket title" : "Host controls story title"}
          </span>
        </div>

        {/* Inputs Row: Active Story Well + Inline Quick Queue Well */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Active Story Input Well with Embedded Mic */}
          <div className="neumorphic-inset-well rounded-2xl border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 flex items-center gap-2.5 flex-1 min-w-0 transition-all focus-within:ring-2 focus-within:ring-indigo-500/40">
            <input
              ref={titleInputRef}
              type="text"
              maxLength={140}
              value={currentInputValue}
              disabled={!isHost && !isEditingCurrent}
              onFocus={() => setIsEditingCurrent(true)}
              onChange={(e) => setCurrentInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isHost) {
                  handleCommitCurrentTitle();
                }
              }}
              className={`flex-1 min-w-0 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none truncate ${
                !isHost && !isEditingCurrent
                  ? "cursor-default select-all"
                  : "cursor-text"
              }`}
              placeholder="Enter story title or speak with mic..."
            />

            {/* Host Save/Set Action */}
            {isHost &&
              isEditingCurrent &&
              currentInputValue !== currentTitle && (
                <button
                  type="button"
                  onClick={handleCommitCurrentTitle}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shrink-0 transition-transform active:scale-95"
                  title="Save active story"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set</span>
                </button>
              )}

            {/* Meaningfully Embedded Mic Button */}
            <button
              ref={micRef}
              type="button"
              onClick={toggleMic}
              className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isMicActive
                  ? "bg-red-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400/40 animate-pulse"
                  : "bg-slate-200/70 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
              title={isMicActive ? "Stop voice listening" : "Speak story title"}
              aria-label="Toggle microphone input"
            >
              {isMicActive ? (
                <MicOff className="w-4 h-4 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Inline Queue Well with Embedded Circular + Button */}
          <form
            onSubmit={handleQuickAdd}
            className="neumorphic-inset-well rounded-2xl border border-slate-200/80 dark:border-slate-800/80 pl-3.5 pr-1.5 py-1.5 flex items-center gap-2 w-full sm:w-64 shrink-0 transition-all focus-within:ring-2 focus-within:ring-indigo-500/40"
          >
            <input
              type="text"
              name="quickQueue"
              maxLength={140}
              value={quickQueueText}
              onChange={(e) => setQuickQueueText(e.target.value)}
              placeholder="Queue ticket for later..."
              className="flex-1 min-w-0 bg-transparent text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!quickQueueText.trim()}
              className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-sm transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Add ticket to backlog queue"
              aria-label="Add ticket to queue"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Pipeline Tray: Up Next & Backlog Horizon */}
      <div className="rounded-2xl p-3 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Up Next Preview */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
            <ArrowRight className="w-3 h-3 text-indigo-500" />
            <span>Up Next</span>
          </div>

          {upNextItem ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {upNextItem.title}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 hidden md:inline">
                (by {upNextItem.addedBy})
              </span>

              {/* Host shortcut to promote directly */}
              {isHost && onPromoteStory && (
                <button
                  type="button"
                  onClick={() => onPromoteStory(upNextItem)}
                  className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors shrink-0"
                  title="Promote to active story now"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic">
              No tickets queued. Anyone can queue a ticket above.
            </span>
          )}
        </div>

        {/* Backlog Horizon & Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/40 dark:border-slate-800/40">
          {remainingBacklog.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-0.5">
              {remainingBacklog.slice(0, 2).map((item, idx) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[120px]"
                  title={item.title}
                >
                  #{idx + 2} {item.title}
                </span>
              ))}
              {remainingBacklog.length > 2 && (
                <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                  +{remainingBacklog.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Full Backlog Drawer Link */}
          <button
            type="button"
            onClick={onOpenFullQueue}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Backlog →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
