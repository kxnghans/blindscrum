"use client";

/**
 * @file page.tsx
 * @description Dynamic room arena page orchestrating the live estimation session,
 * first-run identity onboarding, real-time Story Pipeline, virtual poker table,
 * 3D Fibonacci deck, queue drawer, and analytics.
 */

import { useState, use } from "react";
import { RoomHeader } from "@/components/shared/RoomHeader";
import { UserProfileModal } from "@/components/shared/UserProfileModal";
import { StoryPipeline } from "@/components/arena/StoryPipeline";
import { PokerTable } from "@/components/arena/PokerTable";
import { FibonacciDeck } from "@/components/arena/FibonacciDeck";
import { AnalyticsPanel } from "@/components/arena/AnalyticsPanel";
import { StoryQueueDrawer } from "@/components/queue/StoryQueueDrawer";
import { useScrumSession } from "@/hooks/useScrumSession";
import { useIsMounted } from "@/hooks/useIsMounted";
import { normalizeRoomCode } from "@/utils/roomCode";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params);
  const roomCode = normalizeRoomCode(resolvedParams.code);

  const mounted = useIsMounted();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false);

  const hasConfigured =
    mounted &&
    typeof window !== "undefined" &&
    !!sessionStorage.getItem(`blindscrum_configured_${roomCode}`);

  const isOnboardingOpen = mounted && !hasConfigured && !isOnboardingDismissed;

  const {
    currentUser,
    isHost,
    isConnected,
    storyTitle,
    status,
    participants,
    myVote,
    queue,
    completedStories,
    analytics,
    activeReactions,
    actions,
  } = useScrumSession({ roomCode });

  const handleCompleteOnboarding = (name: string, avatar: string) => {
    actions.updateUserProfile(name, avatar);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`blindscrum_configured_${roomCode}`, "true");
    }
    setIsOnboardingDismissed(true);
  };

  const handleDismissOnboarding = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`blindscrum_configured_${roomCode}`, "true");
    }
    setIsOnboardingDismissed(true);
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
        <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-14 sm:h-16" />
        <main className="flex-1 max-w-7xl mx-auto w-full py-6 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Persistent Navigation Header */}
      <RoomHeader
        roomCode={roomCode}
        currentUser={currentUser}
        onUpdateUser={actions.updateUserProfile}
        isConnected={isConnected}
      />

      {/* Main Estimation Arena */}
      <main className="flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full py-2 sm:py-4">
        {/* Story Pipeline: Active Sizing, Up Next, Backlog Horizon, & Inline Queue */}
        <StoryPipeline
          currentTitle={storyTitle}
          isHost={isHost}
          queue={queue}
          onUpdateTitle={actions.updateStoryTitle}
          onAddToQueue={actions.addToQueue}
          onPromoteStory={(item) => {
            actions.updateStoryTitle(item.title);
            actions.removeFromQueue(item.id);
          }}
          onOpenFullQueue={() => setIsQueueOpen(true)}
        />

        {/* Live Virtual Poker Table with Real-time Voter Indicators & Reactions */}
        <PokerTable
          participants={participants}
          currentUserId={currentUser.id}
          roundStatus={status}
          isHost={isHost}
          onRevealVotes={actions.revealVotes}
          onResetRound={() => actions.resetRound()}
          onNextStory={actions.nextStory}
          hasQueuedStories={queue.length > 0}
          activeReactions={activeReactions}
          onSendReaction={actions.sendReaction}
        />

        {/* Interactive Fibonacci Card Deck */}
        <FibonacciDeck
          selectedVote={myVote}
          roundStatus={status}
          onSelectVote={actions.castVote}
        />

        {/* Post-Reveal Analytics & Insights */}
        {status === "REVEALED" && (
          <AnalyticsPanel
            analytics={analytics}
            storyTitle={storyTitle}
            participants={participants}
          />
        )}
      </main>

      {/* First-Run Profile Onboarding Modal */}
      <UserProfileModal
        isOpen={isOnboardingOpen}
        onClose={handleDismissOnboarding}
        currentUser={currentUser}
        onSave={handleCompleteOnboarding}
        isInitialOnboarding={true}
      />

      {/* Asynchronous Story Queue Drawer for Full Reordering & History */}
      <StoryQueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        completedStories={completedStories}
        isHost={isHost}
        onAddToQueue={actions.addToQueue}
        onRemoveFromQueue={actions.removeFromQueue}
        onReorderQueue={actions.reorderQueue}
        onPromoteStory={(item) => {
          actions.updateStoryTitle(item.title);
          actions.removeFromQueue(item.id);
          setIsQueueOpen(false);
        }}
      />
    </div>
  );
}
