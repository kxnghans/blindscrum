"use client";

/**
 * @file StoryInputBar.tsx
 * @description Main story input with microphone speech-to-text and quick queuing.
 */

import { useState, useRef } from "react";
import { Mic, MicOff, Plus, Check, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

interface StoryInputBarProps {
  currentTitle: string;
  isHost: boolean;
  onUpdateTitle: (title: string) => void;
  onAddToQueue: (title: string) => void;
}

export function StoryInputBar({
  currentTitle,
  isHost,
  onUpdateTitle,
  onAddToQueue,
}: StoryInputBarProps) {
  const [inputValue, setInputValue] = useState(currentTitle);
  const [prevTitle, setPrevTitle] = useState(currentTitle);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const micRef = useRef<HTMLButtonElement | null>(null);

  // Synchronize incoming title updates during render without cascading effect
  if (currentTitle !== prevTitle) {
    setPrevTitle(currentTitle);
    if (!isEditing) {
      setInputValue(currentTitle);
    }
  }

  // Browser speech-to-text
  const { isMicActive, showVisualCues, placeholderText, toggleMic } =
    useVoiceSearch({
      onTranscript: (transcript) => {
        setInputValue(transcript);
        if (isHost) {
          onUpdateTitle(transcript);
        }
      },
      inputRef,
      micRef,
    });

  const handleCommitTitle = () => {
    if (!inputValue.trim()) {
      toast.error("Story title cannot be empty.");
      return;
    }
    onUpdateTitle(inputValue.trim());
    setIsEditing(false);
    toast.success("Story title updated.");
  };

  const handleQuickAddToQueue = () => {
    if (!inputValue.trim()) {
      toast.error("Type a title first.");
      return;
    }
    onAddToQueue(inputValue.trim());
    toast.success("Added to queue.");
    if (inputValue !== currentTitle) {
      setInputValue(currentTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="relative p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-indigo-500/5 transition-all">
        {/* Listening indicator */}
        {showVisualCues && (
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            Listening
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Mic toggle */}
          <button
            ref={micRef}
            type="button"
            onClick={toggleMic}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isMicActive
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 ring-4 ring-red-500/20 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
            title={
              isMicActive ? "Stop listening" : "Click to speak story title"
            }
            aria-label="Toggle microphone input"
          >
            {isMicActive ? (
              <MicOff className="w-5 h-5 animate-bounce" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Title input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              disabled={!isHost && !isEditing}
              onFocus={() => setIsEditing(true)}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (isHost) handleCommitTitle();
                  else handleQuickAddToQueue();
                }
              }}
              placeholder={placeholderText}
              className={`w-full px-3 py-2 text-base font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                !isHost && !isEditing ? "cursor-default" : "cursor-text"
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            {isHost && isEditing && inputValue !== currentTitle && (
              <button
                type="button"
                onClick={handleCommitTitle}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Save story title"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Set</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickAddToQueue}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Add this title to the queue without interrupting the current vote"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Queue</span>
            </button>
          </div>
        </div>

        {/* Sub-bar */}
        <div className="flex items-center justify-between px-3 pt-1.5 pb-0.5 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 mt-1">
          <span className="flex items-center gap-1">
            {isHost ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Host controls active title
              </span>
            ) : (
              <span>Host sets the active story</span>
            )}
          </span>
          <span>Tip: Tap mic or press Enter to queue</span>
        </div>
      </div>
    </div>
  );
}
