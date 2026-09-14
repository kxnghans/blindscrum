"use client";

/**
 * @file ThemeToggle.tsx
 * @description Accessible, tactile toggle switch between dark and light themes.
 * Employs useSyncExternalStore for hydration-safe client rendering without cascading effects.
 */

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
    );
  }

  // 3-way cyclic switching: system -> light -> dark -> system
  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const currentTheme = theme ?? "system";
  const titleText =
    currentTheme === "system"
      ? "System theme (click for light mode)"
      : currentTheme === "light"
        ? "Light theme (click for dark mode)"
        : "Dark theme (click for system mode)";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={titleText}
      title={titleText}
    >
      {currentTheme === "system" ? (
        <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform hover:scale-110" />
      ) : currentTheme === "light" ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-400 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
