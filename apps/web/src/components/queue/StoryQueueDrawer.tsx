"use client";

/**
 * @file StoryQueueDrawer.tsx
 * @description Slide-over drawer managing the asynchronous story estimation queue.
 * Allows participants to add future stories at any time without interrupting active rounds,
 * and maintains a session history of completed sizing estimates.
 */

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  Layers,
  History,
  CheckCircle2,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import type { StoryQueueItem, CompletedStory } from "@/types/scrum";

interface StoryQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: StoryQueueItem[];
  completedStories: CompletedStory[];
  isHost: boolean;
  onAddToQueue: (title: string) => void;
  onRemoveFromQueue: (id: string) => void;
  onReorderQueue: (queue: StoryQueueItem[]) => void;
  onPromoteStory: (item: StoryQueueItem) => void;
}

export function StoryQueueDrawer({
  isOpen,
  onClose,
  queue,
  completedStories,
  isHost,
  onAddToQueue,
  onRemoveFromQueue,
  onReorderQueue,
  onPromoteStory,
}: StoryQueueDrawerProps) {
  const [newTitle, setNewTitle] = useState("");
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a story title.");
      return;
    }
    onAddToQueue(newTitle.trim());
    setNewTitle("");
    toast.success("Queued upcoming story.");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const clone = [...queue];
    const item = clone[index];
    const prev = clone[index - 1];
    if (item && prev) {
      clone[index - 1] = item;
      clone[index] = prev;
      onReorderQueue(clone);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              Story Queue & History
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 gap-1 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "queue"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>Upcoming Queue</span>
            {queue.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                {queue.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Completed</span>
            {completedStories.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {completedStories.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Add Form (Available to all participants asynchronously!) */}
        {activeTab === "queue" && (
          <form onSubmit={handleAdd} className="p-4 border-b border-slate-100 dark:border-slate-800/60">
            <label
              htmlFor="queue-title-input"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5"
            >
              Queue Next Project / Story
            </label>
            <div className="flex gap-2">
              <input
                id="queue-title-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Migrate Auth to OAuth2..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Add to queue"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "queue" ? (
            queue.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  The Queue is Empty
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Add future tickets anytime so you can size them consecutively.
                </p>
              </div>
            ) : (
              queue.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-5 text-center font-mono text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Queued by {item.addedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Move higher in queue"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Promote to active story (Host only) */}
                    {isHost && (
                      <button
                        type="button"
                        onClick={() => onPromoteStory(item)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg"
                        title="Start sizing this story now"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => onRemoveFromQueue(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : completedStories.length === 0 ? (
            <div className="text-center py-12 px-4">
              <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Completed Stories Yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Completed story estimates will appear here automatically when advancing to the next item.
              </p>
            </div>
          ) : (
            completedStories.map((story) => (
              <div
                key={story.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {story.title}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(story.completedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs">
                  {story.estimate} pts
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
