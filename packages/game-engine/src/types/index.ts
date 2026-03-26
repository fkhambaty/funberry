export type GameType =
  | "drag_sort"
  | "memory_match"
  | "picture_quiz"
  | "sequence_builder"
  | "spot_difference"
  | "color_activity"
  | "word_picture_link"
  | "interactive_story"
  | "bubble_pop"
  | "star_catcher";

export interface GameConfig {
  id: string;
  zoneId: string;
  type: GameType;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  maxStars: number;
  timeLimit?: number;
  data: DragSortData | MemoryMatchData | PictureQuizData | SequenceBuilderData | SpotDifferenceData | ColorActivityData | WordPictureLinkData | InteractiveStoryData | BubblePopData | StarCatcherData;
}

/* ── Drag & Sort ── */
export interface DragSortItem {
  id: string;
  label: string;
  emoji: string;
  category: string;
}
export interface DragSortData {
  type: "drag_sort";
  instruction: string;
  categories: { id: string; label: string; emoji: string }[];
  items: DragSortItem[];
}

/* ── Memory Match ── */
export interface MemoryMatchPair {
  id: string;
  front: string;
  emoji: string;
}
export interface MemoryMatchData {
  type: "memory_match";
  instruction: string;
  pairs: MemoryMatchPair[];
}

/* ── Picture Quiz ── */
export interface PictureQuizQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; emoji: string }[];
  correctId: string;
  explanation: string;
}
export interface PictureQuizData {
  type: "picture_quiz";
  instruction: string;
  questions: PictureQuizQuestion[];
}

/* ── Sequence Builder ── */
export interface SequenceStep {
  id: string;
  label: string;
  emoji: string;
  order: number;
}
export interface SequenceBuilderData {
  type: "sequence_builder";
  instruction: string;
  steps: SequenceStep[];
}

/* ── Spot Difference ── */
export interface DifferencePoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
}
export interface SpotDifferenceData {
  type: "spot_difference";
  instruction: string;
  imageA: string;
  imageB: string;
  differences: DifferencePoint[];
}

/* ── Color Activity ── */
export interface ColorRegion {
  id: string;
  label: string;
  correctColor: string;
  path: string;
}
export interface ColorActivityData {
  type: "color_activity";
  instruction: string;
  palette: string[];
  regions: ColorRegion[];
}

/* ── Word-Picture Link ── */
export interface WordPicturePair {
  id: string;
  word: string;
  emoji: string;
}
export interface WordPictureLinkData {
  type: "word_picture_link";
  instruction: string;
  pairs: WordPicturePair[];
}

/* ── Interactive Story ── */
export interface StoryPage {
  id: string;
  text: string;
  emoji: string;
  choices?: { id: string; label: string; nextPageId: string; correct: boolean }[];
}
export interface InteractiveStoryData {
  type: "interactive_story";
  instruction: string;
  pages: StoryPage[];
}

/* ── Game State ── */
export interface GameState {
  status: "idle" | "playing" | "paused" | "completed";
  score: number;
  maxScore: number;
  starsEarned: number;
  timeElapsed: number;
  timeLimit: number | null;
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<string, boolean>;
}

export interface GameResult {
  score: number;
  maxScore: number;
  starsEarned: number;
  timeSpent: number;
  accuracy: number;
}

/* ── Bubble Pop Adventure ── */
export interface BubbleItem {
  id: string;
  label: string;
  emoji: string;
  isTarget: boolean;
  color: string;
}
export interface BubblePopData {
  type: "bubble_pop";
  instruction: string;
  question: string;
  character: string;
  targetHint: string;
  bubbles: BubbleItem[];
}

/* ── Star Catcher ── */
export interface CatchItem {
  id: string;
  label: string;
  emoji: string;
  isTarget: boolean;
}
export interface StarCatcherData {
  type: "star_catcher";
  instruction: string;
  question: string;
  character: string;
  targetCategory: string;
  items: CatchItem[];
  lives: number;
}
