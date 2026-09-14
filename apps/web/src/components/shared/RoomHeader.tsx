"use client";

/**
 * @file RoomHeader.tsx
 * @description Top navigation bar with room code, share link, profile pill, and queue drawer trigger.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Layers, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";
import { UserProfileModal } from "./UserProfileModal";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { Participant } from "@/types/scrum";

interface RoomHeaderProps {
  roomCode: string;
  currentUser: Participant;
  queueCount: number;
  onOpenQueue: () => void;
  onUpdateUser: (name: string, avatar: string) => void;
  isConnected: boolean;
}

export function RoomHeader({
  roomCode,
  currentUser,
  queueCount,
  onOpenQueue,
  onUpdateUser,
  isConnected,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const mounted = useIsMounted();

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/room/${roomCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Room link copied.", {
        description: "Send this to teammates to join the room.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Code */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-lg tracking-tight hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">BlindScrum</span>
            </Link>

            {/* Room Code Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                title={isConnected ? "Connected" : "Connecting..."}
              />
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                {roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors"
                title="Copy share link"
                aria-label="Copy room link"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Story Queue */}
            <button
              type="button"
              onClick={onOpenQueue}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Open story queue"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">Queue</span>
              {queueCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                  {queueCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Edit name and avatar"
            >
              <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-indigo-500/20">
                {mounted && currentUser.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 m-auto text-slate-400" />
                )}
              </div>
              <span className="max-w-[100px] truncate">
                {mounted ? currentUser.name : "..."}
              </span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onSave={onUpdateUser}
      />
    </>
  );
}
