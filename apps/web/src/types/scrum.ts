/**
 * @file scrum.ts
 * @description Core domain models and typing contracts for the BlindScrum engine.
 * Enforces strict zero-any typing across participants, votes, rooms, and analytics.
 */

export const FIBONACCI_CARDS = [1, 2, 3, 5, 8, 13, 20] as const;
export type FibonacciValue = (typeof FIBONACCI_CARDS)[number];

export type RoundStatus = "IDLE" | "VOTING" | "REVEALED";

export type ParticipantRole = "host" | "voter";

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: ParticipantRole;
  hasVoted: boolean;
  vote: FibonacciValue | null;
  joinedAt: number;
}

export interface StoryQueueItem {
  id: string;
  title: string;
  addedBy: string;
  addedAt: number;
  finalEstimate?: FibonacciValue | number | null;
}

export interface VoteDistributionItem {
  value: FibonacciValue;
  count: number;
  percentage: number;
}

export interface VoteAnalytics {
  totalVotes: number;
  average: number | null;
  mode: FibonacciValue | null;
  modeCount: number;
  modePercentage: number;
  min: number | null;
  max: number | null;
  spread: number | null;
  distribution: VoteDistributionItem[];
  hasConsensus: boolean;
}

export interface CompletedStory {
  id: string;
  title: string;
  estimate: FibonacciValue | number;
  completedAt: number;
  average?: number | null;
}

export interface ScrumRoomState {
  roomCode: string;
  storyTitle: string;
  status: RoundStatus;
  participants: Participant[];
  queue: StoryQueueItem[];
  completedStories: CompletedStory[];
}

export type TableReactionType = "egg" | "tomato" | "gas" | "cheers" | "zap";

export interface TableReactionPayload {
  id: string;
  senderId: string;
  senderName: string;
  targetId: string;
  type: TableReactionType;
  timestamp: number;
}

export type ScrumBroadcastEvent =
  | { type: "SYNC_STATE"; payload: ScrumRoomState }
  | { type: "UPDATE_TITLE"; payload: { title: string } }
  | {
      type: "CAST_BLIND_VOTE";
      payload: { participantId: string; hasVoted: boolean };
    }
  | { type: "REVEAL_VOTES"; payload: { votes: Record<string, FibonacciValue> } }
  | { type: "RESET_ROUND"; payload: { storyTitle?: string } }
  | { type: "ADD_QUEUE_ITEM"; payload: { item: StoryQueueItem } }
  | { type: "REMOVE_QUEUE_ITEM"; payload: { id: string } }
  | { type: "REORDER_QUEUE"; payload: { queue: StoryQueueItem[] } }
  | {
      type: "NEXT_STORY";
      payload: {
        nextStory: StoryQueueItem;
        archivedEstimate?: FibonacciValue | number | null;
      };
    }
  | { type: "THROW_REACTION"; payload: TableReactionPayload };
