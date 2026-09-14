"use client";

/**
 * @file UserProfileModal.tsx
 * @description In-place modal dialog allowing participants to update their alias or regenerate avatars.
 */

import { useState } from "react";
import Image from "next/image";
import { X, RefreshCw, Check } from "lucide-react";
import { generateRandomScrumAlias, generateScrumAvatar } from "@/utils/persona";
import type { Participant } from "@/types/scrum";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Participant;
  onSave: (name: string, avatar: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
}: UserProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomName = generateRandomScrumAlias();
    setName(randomName);
    setAvatar(generateScrumAvatar(randomName));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim() || currentUser.name, avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Customize Your Scrum Persona
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Your avatar and moniker are visible to everyone on the planning board.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-indigo-500/20">
              <Image
                src={avatar}
                alt="Avatar Preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avatar Preview
              </p>
              <button
                type="button"
                onClick={handleRandomize}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Moniker & Face
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="persona-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Moniker / Username
            </label>
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Save Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
