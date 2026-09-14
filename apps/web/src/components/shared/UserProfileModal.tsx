"use client";

/**
 * @file UserProfileModal.tsx
 * @description Dialog allowing participants to edit their display name and avatar.
 */

import { useState } from "react";
import Image from "next/image";
import { X, RefreshCw, Check, Dices, Sparkles } from "lucide-react";
import {
  generateRandomScrumAlias,
  generateScrumAvatar,
  AVATAR_PRESETS,
} from "@/utils/persona";
import type { Participant } from "@/types/scrum";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Participant;
  onSave: (name: string, avatar: string) => void;
  isInitialOnboarding?: boolean;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  isInitialOnboarding = false,
}: UserProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [prevUser, setPrevUser] = useState(currentUser);

  // Synchronize internal state during render when currentUser changes from parent
  if (
    currentUser.name !== prevUser.name ||
    currentUser.avatar !== prevUser.avatar
  ) {
    setPrevUser(currentUser);
    setName(currentUser.name);
    setAvatar(currentUser.avatar);
  }

  if (!isOpen) return null;

  // Generate both random persona name and matched avatar
  const handleRandomize = () => {
    const randomName = generateRandomScrumAlias();
    setName(randomName);
    setAvatar(generateScrumAvatar(randomName));
  };

  // Shuffle just the avatar independently
  const handleShuffleAvatar = () => {
    const randomSeed = `avatar_${Math.random().toString(36).substring(2, 8)}`;
    setAvatar(generateScrumAvatar(randomSeed));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim() || currentUser.name, avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          {isInitialOnboarding && (
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isInitialOnboarding ? "Welcome to the Room" : "Edit Profile"}
          </h3>
        </div>

        {isInitialOnboarding && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Pick an avatar or randomize your alias before joining.
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Preview & Selection Menu */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-indigo-500/20">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Active Avatar
                </p>
                <button
                  type="button"
                  onClick={handleShuffleAvatar}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Shuffle New Look
                </button>
              </div>
            </div>

            {/* Avatar Preset Gallery */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Choose a Character
              </p>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatar === preset.avatar;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatar(preset.avatar)}
                      className={`relative w-10 h-10 rounded-xl overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? "ring-2 ring-indigo-500 scale-105 shadow-md shadow-indigo-500/25"
                          : "opacity-75 hover:opacity-100 hover:scale-105 border border-slate-300/60 dark:border-slate-700/60"
                      }`}
                      title={preset.name}
                      aria-label={`Select ${preset.name} avatar`}
                    >
                      <Image
                        src={preset.avatar}
                        alt={preset.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Display Name & One-Click Randomizer */}
          <div>
            <label
              htmlFor="persona-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Display Name
            </label>
            <div className="flex items-center gap-2">
              <input
                id="persona-name"
                type="text"
                maxLength={28}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setAvatar(generateScrumAvatar(e.target.value));
                }}
                placeholder="e.g. Velocity Falcon"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleRandomize}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shrink-0"
                title="Randomly assign a persona name and avatar"
              >
                <Dices className="w-4 h-4" />
                <span>Randomize</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isInitialOnboarding ? "Skip for now" : "Cancel"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isInitialOnboarding ? "Join Table" : "Save"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
