"use client";

/**
 * @file AnalyticsPanel.tsx
 * @description Comprehensive post-reveal estimation analytics dashboard.
 * Displays vote frequency bar chart, statistical summary cards (Average, Mode, Spread),
 * consensus alerts, and one-click Jira/Linear markdown export.
 */

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { VoteAnalytics, Participant } from "@/types/scrum";

interface AnalyticsPanelProps {
  analytics: VoteAnalytics | null;
  storyTitle: string;
  participants: Participant[];
}

export function AnalyticsPanel({
  analytics,
  storyTitle,
  participants,
}: AnalyticsPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!analytics || analytics.totalVotes === 0) {
    return null;
  }

  const {
    average,
    mode,
    modeCount,
    modePercentage,
    min,
    max,
    spread,
    distribution,
    hasConsensus,
  } = analytics;

  const maxBarCount = Math.max(...distribution.map((d) => d.count), 1);

  const handleCopyMarkdown = async () => {
    const lines = [
      `### 🃏 BlindScrum Estimation: ${storyTitle}`,
      `- **Consensus / Mode**: ${mode ?? "N/A"} pts (${modeCount} votes, ${modePercentage}%)`,
      `- **Average**: ${average !== null ? `${average} pts` : "N/A"}`,
      `- **Spread**: ${min !== null && max !== null ? `${min} - ${max} pts (Δ ${spread})` : "N/A"}`,
      `- **Total Participants**: ${analytics.totalVotes}`,
      ``,
      `| Teammate | Vote |`,
      `| :--- | :--- |`,
      ...participants
        .filter((p) => p.vote !== null)
        .map((p) => `| ${p.name} | **${p.vote}** |`),
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      toast.success("Markdown summary copied!", {
        description: "Formatted table ready to paste into Jira, Linear, or Slack.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy markdown.");
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto my-8 px-4 animate-in fade-in-50 duration-300">
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Section Header with Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Estimation Analytics
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown for: <span className="font-semibold text-slate-700 dark:text-slate-300">&ldquo;{storyTitle}&rdquo;</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 self-start sm:self-auto"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{copied ? "Copied Markdown" : "Copy Jira/Linear Markdown"}</span>
          </button>
        </div>

        {/* Consensus Alert Ribbon */}
        {hasConsensus ? (
          <div className="my-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <Award className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              <strong>Strong Consensus Reached!</strong> Over {modePercentage}% of the team agreed on <strong>{mode} story points</strong>.
            </span>
          </div>
        ) : spread !== null && spread >= 5 ? (
          <div className="my-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              <strong>High Estimation Divergence (Spread: {spread} pts).</strong> Votes range from {min} to {max}. Consider discussing outliers before proceeding.
            </span>
          </div>
        ) : null}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* Mode / Most Selected Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Majority Option
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {mode !== null ? `${mode} pts` : "N/A"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {modeCount} votes ({modePercentage}% consensus)
              </p>
            </div>
          </div>

          {/* Average Story Points */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Arithmetic Average
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {average !== null ? `${average}` : "N/A"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mean across {analytics.totalVotes} responses
              </p>
            </div>
          </div>

          {/* Spread / Divergence */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Range & Spread
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {min !== null && max !== null ? `${min} – ${max}` : "N/A"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {spread !== null ? `Spread of ${spread} points` : "Single vote"}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Vote Distribution Bar Chart */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Vote Distribution Frequency
          </p>

          <div className="space-y-3">
            {distribution.map((dist) => {
              const isModeOption = dist.value === mode;
              const ratio = dist.count / maxBarCount;

              return (
                <div key={String(dist.value)} className="flex items-center gap-3">
                  {/* Card Label */}
                  <div className="w-10 text-right font-mono font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                    {dist.value}
                  </div>

                  {/* Horizontal Bar Graphic */}
                  <div className="flex-1 h-7 rounded-xl bg-slate-100 dark:bg-slate-950 p-1 overflow-hidden relative border border-slate-200/50 dark:border-slate-800/50">
                    <div
                      className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2 ${
                        isModeOption
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm"
                          : "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                      style={{ width: `${Math.max(ratio * 100, dist.count > 0 ? 12 : 0)}%` }}
                    >
                      {dist.count > 0 && (
                        <span className="text-[10px] font-extrabold tracking-tight">
                          {dist.count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Percentage Indicator */}
                  <div className="w-12 text-xs font-semibold text-slate-400 dark:text-slate-500 text-left">
                    {dist.count > 0 ? `${dist.percentage}%` : "0%"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
