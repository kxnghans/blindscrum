"use client";

/**
 * @file page.tsx
 * @description Landing page to start a room, join by code, or auto-join via link query.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  generateRoomCode,
  normalizeRoomCode,
  isValidRoomCode,
} from "@/utils/roomCode";
import { generateRandomScrumAlias, generateScrumAvatar } from "@/utils/persona";
import type { Participant } from "@/types/scrum";

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputCode, setInputCode] = useState("");

  // Default user setup for room bootstrapping
  const [user] = useState<Participant>(() => {
    if (typeof window === "undefined") {
      return {
        id: "init",
        name: "Agile Falcon",
        avatar: "",
        role: "voter",
        hasVoted: false,
        vote: null,
        joinedAt: Date.now(),
      };
    }
    const name = generateRandomScrumAlias();
    const avatar = generateScrumAvatar(name);
    return {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name,
      avatar,
      role: "voter",
      hasVoted: false,
      vote: null,
      joinedAt: Date.now(),
    };
  });

  // Handle direct ?room= link joins
  useEffect(() => {
    const roomParam = searchParams.get("room") || searchParams.get("code");
    if (roomParam) {
      const normalized = normalizeRoomCode(roomParam);
      if (isValidRoomCode(normalized)) {
        router.push(`/room/${normalized}`);
      }
    }
  }, [searchParams, router]);

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`blindscrum_user_${code}`, JSON.stringify(user));
    }
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(inputCode);
    if (!isValidRoomCode(clean)) {
      toast.error("Enter a valid code, like SCRUM-492.");
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`blindscrum_user_${clean}`, JSON.stringify(user));
    }
    router.push(`/room/${clean}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Top navigation */}
      <div className="w-full flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-2 font-extrabold text-lg text-slate-900 dark:text-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>BlindScrum</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Manage your stories. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500">
            Estimate without bias.
          </span>
        </h1>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
        {/* Create Room */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/25 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-indigo-200" />
            </div>
            <h2 className="text-xl font-black mb-1.5">Start a Room</h2>
            <p className="text-xs text-indigo-100/85 mb-6 leading-relaxed">
              Get a link for your team. You manage the active story and flip the cards.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateRoom}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            <span>Create Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Join Room */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-700 dark:text-slate-300">
              <Layers className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">
              Join a Room
            </h2>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. SCRUM-492"
              className="w-full px-4 py-2.5 rounded-2xl neumorphic-inset-well border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-center tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Join Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Practical details - minimalist badge highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No databases
          </h3>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Voice mic input
          </h3>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Story queue
          </h3>
        </div>
      </div>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
