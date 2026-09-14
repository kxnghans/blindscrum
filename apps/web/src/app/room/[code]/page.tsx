"use client";

/**
 * @file page.tsx
 * @description Dynamic room arena page orchestrating the live estimation session,
 * voice-enabled story input, 3D Fibonacci deck, poker table, queue drawer, and analytics.
 */

import { useState, use } from "react";
import { RoomHeader } from "@/components/shared/RoomHeader";
import { StoryInputBar } from "@/components/arena/StoryInputBar";
import { PokerTable } from "@/components/arena/PokerTable";
import { FibonacciDeck } from "@/components/arena/FibonacciDeck";
import { AnalyticsPanel } from "@/components/arena/AnalyticsPanel";
import { StoryQueueDrawer } from "@/components/queue/StoryQueueDrawer";
import { useScrumSession } from "@/hooks/useScrumSession";
import { normalizeRoomCode } from "@/utils/roomCode";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params);
  const roomCode = normalizeRoomCode(resolvedParams.code);

  const [isQueueOpen, setIsQueueOpen] = useState(false);

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
    actions,
  } = useScrumSession({ roomCode });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Persistent Navigation Header */}
      <RoomHeader
        roomCode={roomCode}
        currentUser={currentUser}
        queueCount={queue.length}
        onOpenQueue={() => setIsQueueOpen(true)}
        onUpdateUser={actions.updateUserProfile}
        isConnected={isConnected}
      />

      {/* Main Estimation Arena */}
      <main className="flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full py-4 sm:py-6">
        {/* Story Title & Voice Input Bar */}
        <StoryInputBar
          currentTitle={storyTitle}
          isHost={isHost}
          onUpdateTitle={actions.updateStoryTitle}
          onAddToQueue={actions.addToQueue}
        />

        {/* Live Virtual Poker Table */}
        <PokerTable
          participants={participants}
          currentUserId={currentUser.id}
          roundStatus={status}
          isHost={isHost}
          onRevealVotes={actions.revealVotes}
          onResetRound={() => actions.resetRound()}
          onNextStory={actions.nextStory}
          hasQueuedStories={queue.length > 0}
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

      {/* Asynchronous Story Queue Drawer */}
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
