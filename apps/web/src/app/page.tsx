"use client";

/**
 * @file page.tsx
 * @description Landing page to start a room, join by code, or auto-join via link query.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Edit2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserProfileModal } from "@/components/shared/UserProfileModal";
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from "@/utils/roomCode";
import { generateRandomScrumAlias, generateScrumAvatar } from "@/utils/persona";
import type { Participant } from "@/types/scrum";

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputCode, setInputCode] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Default user setup
  const [user, setUser] = useState<Participant>(() => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
          <Lock className="w-3.5 h-3.5" />
          <span>In-memory sessions. Hidden votes until reveal.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-4">
          Point stories fast. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500">
            Without anchoring each other.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Share a link with your team. Speak or type the story title, vote in secret, and reveal the breakdown together. No accounts, no database, no setup.
        </p>
      </div>

      {/* Identity preview */}
      <div className="mb-8 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-indigo-500/20 shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-indigo-500" />
          )}
        </div>
        <div className="text-left">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Joining as
          </p>
          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
            {user.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Change name or avatar"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
        {/* Create Room */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/25 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-indigo-200" />
            </div>
            <h2 className="text-xl font-black mb-1">Start a Room</h2>
            <p className="text-xs text-indigo-100/80 mb-6">
              Create a fresh room and get a link. You control the active story and when to flip the cards.
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
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
              Join a Room
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Have a code from your lead? Paste it here to drop straight into the session.
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. SCRUM-492"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-center tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Practical details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No databases
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              State lives in browser memory. When the tab closes, the room is gone.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Voice mic input
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Read ticket titles out loud. It transcribes live and stops when you pause.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Story queue
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Stack upcoming tickets in the drawer while the team is still voting.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={user}
        onSave={(newName, newAvatar) => {
          setUser((prev) => ({ ...prev, name: newName, avatar: newAvatar }));
        }}
      />
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
