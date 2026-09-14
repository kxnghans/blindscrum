"use client";

/**
 * @file UserProfileModal.tsx
 * @description Dialog for participants to customize their persona avatar,
 * color palette, and display name with live interactive preview.
 */

import { useState } from "react";
import Image from "next/image";
import { X, RefreshCw, Check, Dices, Sparkles } from "lucide-react";
import {
  generateRandomScrumAlias,
  renderAvatarSvg,
  ARCHETYPES,
  COLOR_PALETTES,
  type AvatarArchetypeId,
} from "@/utils/persona";
import type { Participant } from "@/types/scrum";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Participant;
  onSave: (name: string, avatar: string) => void;
  isInitialOnboarding?: boolean;
}

/**
 * Resolves the archetype ID and color palette ID from an existing avatar data URI.
 */
function resolveArchetypeAndPalette(avatarUri: string): {
  archetypeId: AvatarArchetypeId;
  paletteId: string;
} {
  if (!avatarUri) {
    return { archetypeId: "fox", paletteId: "indigo" };
  }

  // Exact match search across archetype and palette combinations
  for (const pal of COLOR_PALETTES) {
    for (const arch of ARCHETYPES) {
      if (renderAvatarSvg(arch.id, pal.id) === avatarUri) {
        return { archetypeId: arch.id, paletteId: pal.id };
      }
    }
  }

  // Fallback heuristic: check if palette id is encoded in URI
  for (const pal of COLOR_PALETTES) {
    if (avatarUri.includes(pal.id)) {
      return { archetypeId: "fox", paletteId: pal.id };
    }
  }

  return { archetypeId: "fox", paletteId: "indigo" };
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  isInitialOnboarding = false,
}: UserProfileModalProps) {
  // Resolve initial archetype and palette
  const initialConfig = resolveArchetypeAndPalette(currentUser.avatar);

  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(
    currentUser.avatar ||
      renderAvatarSvg(initialConfig.archetypeId, initialConfig.paletteId),
  );
  const [selectedArchetype, setSelectedArchetype] = useState<AvatarArchetypeId>(
    initialConfig.archetypeId,
  );
  const [selectedPalette, setSelectedPalette] = useState<string>(
    initialConfig.paletteId,
  );
  const [prevUser, setPrevUser] = useState(currentUser);

  // Synchronize internal state during render when currentUser changes from parent
  if (
    currentUser.name !== prevUser.name ||
    currentUser.avatar !== prevUser.avatar
  ) {
    setPrevUser(currentUser);
    setName(currentUser.name);
    const resolved = resolveArchetypeAndPalette(currentUser.avatar);
    setSelectedArchetype(resolved.archetypeId);
    setSelectedPalette(resolved.paletteId);
    setAvatar(
      currentUser.avatar ||
        renderAvatarSvg(resolved.archetypeId, resolved.paletteId),
    );
  }

  if (!isOpen) return null;

  // Select an archetype: updates archetype while preserving selected color palette
  const handleSelectArchetype = (archId: AvatarArchetypeId) => {
    setSelectedArchetype(archId);
    const newAvatar = renderAvatarSvg(archId, selectedPalette);
    setAvatar(newAvatar);
  };

  // Select a color palette: updates palette while preserving selected archetype
  const handleSelectPalette = (paletteId: string) => {
    setSelectedPalette(paletteId);
    const newAvatar = renderAvatarSvg(selectedArchetype, paletteId);
    setAvatar(newAvatar);
  };

  // Shuffle both archetype and color palette together
  const handleShuffleLook = () => {
    const randomArch =
      ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)]!.id;
    const randomPal =
      COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]!.id;
    setSelectedArchetype(randomArch);
    setSelectedPalette(randomPal);
    setAvatar(renderAvatarSvg(randomArch, randomPal));
  };

  // Generate a full random identity: persona name + archetype + color
  const handleRandomizeAll = () => {
    const randomName = generateRandomScrumAlias();
    const randomArch =
      ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)]!.id;
    const randomPal =
      COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]!.id;
    setName(randomName);
    setSelectedArchetype(randomArch);
    setSelectedPalette(randomPal);
    setAvatar(renderAvatarSvg(randomArch, randomPal));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim() || currentUser.name, avatar);
    onClose();
  };

  const activeArchetype =
    ARCHETYPES.find((a) => a.id === selectedArchetype) ?? ARCHETYPES[0]!;
  const activePalette =
    COLOR_PALETTES.find((p) => p.id === selectedPalette) ?? COLOR_PALETTES[0]!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title (Clean, no redundant subtitles) */}
        <div className="flex items-center gap-2 mb-4">
          {isInitialOnboarding && (
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isInitialOnboarding ? "Welcome to the Room" : "Customize Profile"}
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Active Preview Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-indigo-500/20">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Active Avatar Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {activePalette.name} {activeArchetype.name}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                  {name || "Anonymous Voter"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShuffleLook}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs"
              title="Shuffle avatar and color"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Step 1: Select Avatar Archetype */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              1. Select Avatar
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ARCHETYPES.map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                // Render preview of each archetype with current color palette
                const previewSvg = renderAvatarSvg(arch.id, selectedPalette);

                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => handleSelectArchetype(arch.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500 scale-105 shadow-sm"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/80 opacity-80 hover:opacity-100"
                    }`}
                    title={arch.name}
                    aria-label={`Select ${arch.name} avatar`}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                      <Image
                        src={previewSvg}
                        alt={arch.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[48px]">
                      {arch.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Isolated Color Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Select Color
              </label>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {activePalette.name}
              </span>
            </div>

            {/* Horizontal Color Bar */}
            <div className="p-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 sm:gap-1.5">
              {COLOR_PALETTES.map((palette) => {
                const isSelected = selectedPalette === palette.id;
                const isWhite = palette.id === "white";

                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => handleSelectPalette(palette.id)}
                    className={`relative w-6 h-6 rounded-full transition-all flex items-center justify-center border border-black/10 dark:border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-sm"
                        : "hover:scale-110 opacity-90 hover:opacity-100"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${palette.bg1}, ${palette.bg2})`,
                    }}
                    title={palette.name}
                    aria-label={`Select ${palette.name} color palette`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 ${isWhite ? "text-slate-900" : "text-white"} drop-shadow-xs`}
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Display Name & One-Click Randomizer */}
          <div>
            <label
              htmlFor="persona-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              3. Display Name
            </label>
            <div className="flex items-center gap-2">
              <input
                id="persona-name"
                type="text"
                maxLength={28}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Velocity Falcon"
                className="flex-1 px-3.5 py-2 rounded-xl neumorphic-inset-well border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={handleRandomizeAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shrink-0"
                title="Randomly generate persona name and look"
              >
                <Dices className="w-4 h-4" />
                <span>Randomize</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
