"use client";

/**
 * @file StoryPipeline.tsx
 * @description Progressive pipeline with a single active input:
 * - State A: Setting active project title with mic dictation and host confirmation.
 * - State B: Actively sizing project card with edit toggle + inline queue input with mic and + button.
 * Usable by any participant, accommodating long project titles up to 15 words.
 */

import { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Plus,
  Play,
  Layers,
  X,
  Pencil,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { type StoryQueueItem, MAX_STORY_TITLE_LENGTH } from "@/types/scrum";

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

  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const quickQueueInputRef = useRef<HTMLInputElement | null>(null);
  const micRef = useRef<HTMLButtonElement | null>(null);

  // Sync incoming title changes from remote host
  if (currentTitle !== prevTitle) {
    setPrevTitle(currentTitle);
    if (!isEditingCurrent) {
      setCurrentInputValue(currentTitle);
    }
  }

  const hasActiveTitle = Boolean(currentTitle.trim());
  // Progressive input condition: host is setting title if empty or actively editing
  const isEditingActive = isHost
    ? !hasActiveTitle || isEditingCurrent
    : !hasActiveTitle;

  // Speech-to-text hook: dynamically routes dictation to whichever input is active
  const { isMicActive, showVisualCues, toggleMic } = useVoiceSearch({
    onTranscript: (transcript) => {
      if (isEditingActive) {
        setCurrentInputValue(transcript);
        if (isHost) {
          onUpdateTitle(transcript);
        }
      } else {
        setQuickQueueText(transcript);
      }
    },
    inputRef: isEditingActive ? singleInputRef : quickQueueInputRef,
    micRef,
  });

  const handleCommitCurrentTitle = () => {
    if (!currentInputValue.trim()) {
      toast.error("Project title cannot be empty.");
      return;
    }
    onUpdateTitle(currentInputValue.trim());
    setIsEditingCurrent(false);
    toast.success(
      isEditingCurrent ? "Active project updated." : "Project sizing started.",
    );
  };

  const handleCancelEditing = () => {
    setCurrentInputValue(currentTitle);
    setIsEditingCurrent(false);
  };

  const handleQuickAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const form = e?.target as HTMLFormElement | undefined;
    const formVal = form
      ? (new FormData(form).get("quickQueue") as string | null)
      : null;
    const trimmed = (formVal ?? quickQueueText).trim();
    if (!trimmed) {
      toast.error("Type a project title to queue.");
      return;
    }
    onAddToQueue(trimmed);
    setQuickQueueText("");
    toast.success("Added to queue.", {
      description: `"${trimmed.slice(0, 45)}${trimmed.length > 45 ? "..." : ""}"`,
    });
  };

  const upNextItem = queue[0] ?? null;
  const remainingBacklog = queue.slice(1);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-3 sm:my-4 space-y-2.5 sm:space-y-3">
      {/* Top Banner: Single Progressive Input Container */}
      <div className="relative rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all">
        {/* State A: Initial Project Title Setup or Host Editing Mode */}
        {isEditingActive ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  {isEditingCurrent
                    ? "Edit Project"
                    : !hasActiveTitle
                      ? "Enter Project"
                      : "Now Sizing"}
                </span>

                {showVisualCues && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Listening...
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                {isHost
                  ? isEditingCurrent
                    ? "Update project title or speak into microphone"
                    : "Enter project title to start sizing"
                  : "Waiting for host to set active project..."}
              </span>
            </div>

            {/* Single Input Well for Setting Active Project */}
            <div className="neumorphic-inset-well rounded-2xl border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 flex items-center gap-2.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/40">
              <input
                ref={singleInputRef}
                type="text"
                maxLength={MAX_STORY_TITLE_LENGTH}
                value={currentInputValue}
                disabled={!isHost}
                onChange={(e) => setCurrentInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isHost) {
                    handleCommitCurrentTitle();
                  } else if (e.key === "Escape" && isEditingCurrent) {
                    handleCancelEditing();
                  }
                }}
                className={`flex-1 min-w-0 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 ${
                  !isHost ? "cursor-not-allowed opacity-60" : "cursor-text"
                }`}
                placeholder={
                  isHost
                    ? isEditingCurrent
                      ? "Enter project title or speak with mic..."
                      : "Enter project title to start sizing..."
                    : "Waiting for host to set project..."
                }
              />

              {/* Character Limit Badge (Tactile feedback when typing) */}
              {isHost && currentInputValue.length > 0 && (
                <span
                  className={`text-[10px] font-mono tracking-tight shrink-0 select-none px-1.5 py-0.5 rounded-md transition-colors ${
                    currentInputValue.length >= MAX_STORY_TITLE_LENGTH
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold"
                      : currentInputValue.length >= 250
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                  title={`${currentInputValue.length} of ${MAX_STORY_TITLE_LENGTH} characters`}
                >
                  {currentInputValue.length}/{MAX_STORY_TITLE_LENGTH}
                </span>
              )}

              {/* Host Save & Cancel Controls */}
              {isHost && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditingCurrent && (
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Cancel editing"
                      aria-label="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCommitCurrentTitle}
                    disabled={!currentInputValue.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
                    title={
                      isEditingCurrent
                        ? "Save active project"
                        : "Start sizing project"
                    }
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isEditingCurrent ? "Save" : "Start"}</span>
                  </button>
                </div>
              )}

              {/* Embedded Mic Button */}
              <button
                ref={micRef}
                type="button"
                onClick={toggleMic}
                disabled={!isHost}
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 ${
                  isMicActive
                    ? "bg-red-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400/40 animate-pulse"
                    : "bg-slate-200/70 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
                title={
                  isMicActive ? "Stop voice listening" : "Speak project title"
                }
                aria-label="Toggle microphone input"
              >
                {isMicActive ? (
                  <MicOff className="w-4 h-4 animate-bounce" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          /* State B: Prominent Active Sizing (Left) + Side Queue Input (Right) */
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Actively Sizing Project Block: Space, Presence & Clean Hierarchy */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Now Sizing
                </span>

                {isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentInputValue(currentTitle);
                      setIsEditingCurrent(true);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit active project title"
                    aria-label="Edit active project"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Prominent Active Project Title with Clean Space and Presence */}
              <h2
                className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight break-words line-clamp-3"
                title={currentTitle}
              >
                {currentTitle}
              </h2>
            </div>

            {/* Right Side: Inline Queue Input Field with Embedded Mic & Circular Plus */}
            <div className="w-full md:w-80 shrink-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Queue project
                </span>
                {showVisualCues && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Listening...
                  </span>
                )}
              </div>

              <form
                onSubmit={handleQuickAdd}
                className="neumorphic-inset-well rounded-2xl border border-slate-200/80 dark:border-slate-800/80 pl-2 pr-1.5 py-1.5 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/40"
              >
                {/* Voice Mic inside Queue Input */}
                <button
                  ref={micRef}
                  type="button"
                  onClick={toggleMic}
                  className={`relative flex items-center justify-center w-7 h-7 rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isMicActive
                      ? "bg-red-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400/40 animate-pulse"
                      : "bg-slate-200/70 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                  title={
                    isMicActive
                      ? "Stop voice listening"
                      : "Speak project title to queue"
                  }
                  aria-label="Toggle microphone for queue"
                >
                  {isMicActive ? (
                    <MicOff className="w-3.5 h-3.5 animate-bounce" />
                  ) : (
                    <Mic className="w-3.5 h-3.5" />
                  )}
                </button>

                <input
                  ref={quickQueueInputRef}
                  type="text"
                  name="quickQueue"
                  maxLength={MAX_STORY_TITLE_LENGTH}
                  value={quickQueueText}
                  onChange={(e) => setQuickQueueText(e.target.value)}
                  placeholder="Queue project or speak..."
                  className="flex-1 min-w-0 bg-transparent text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />

                {/* Character Limit indicator for Quick Queue */}
                {quickQueueText.length > 0 && (
                  <span
                    className={`text-[10px] font-mono tracking-tight shrink-0 select-none px-1 py-0.5 rounded transition-colors ${
                      quickQueueText.length >= MAX_STORY_TITLE_LENGTH
                        ? "text-rose-600 dark:text-rose-400 font-bold"
                        : quickQueueText.length >= 250
                          ? "text-amber-600 dark:text-amber-400 font-semibold"
                          : "text-slate-400 dark:text-slate-500"
                    }`}
                    title={`${quickQueueText.length} of ${MAX_STORY_TITLE_LENGTH} characters`}
                  >
                    {quickQueueText.length}/{MAX_STORY_TITLE_LENGTH}
                  </span>
                )}

                {/* Circular + Button */}
                <button
                  type="submit"
                  disabled={!quickQueueText.trim()}
                  className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-sm transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Add project to queue"
                  aria-label="Add project to queue"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Tray: Up Next Preview & View Queue Link */}
      <div className="rounded-2xl p-3 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Up Next Preview accommodating long titles up to 15 words */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
            <ArrowRight className="w-3 h-3 text-indigo-500" />
            <span>Up Next</span>
          </div>

          {upNextItem ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className="font-semibold text-slate-800 dark:text-slate-200 break-words line-clamp-2 max-w-xl"
                title={upNextItem.title}
              >
                {upNextItem.title}
              </span>

              {/* Host shortcut to promote directly */}
              {isHost && onPromoteStory && (
                <button
                  type="button"
                  onClick={() => onPromoteStory(upNextItem)}
                  className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors shrink-0"
                  title="Size this project now"
                  aria-label="Size this project now"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic">
              No projects queued yet.
            </span>
          )}
        </div>

        {/* Backlog Horizon Pills & Queue Drawer Link */}
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

          {/* View Queue Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenFullQueue}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              View Queue {queue.length > 0 ? `(${queue.length})` : ""} →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
