export type Difficulty = "easy" | "medium" | "hard";

export type QuestionCategory =
  | "old-testament"
  | "new-testament"
  | "psalms-proverbs"
  | "general";

export type AnswerOption = "A" | "B" | "C" | "D";

export interface BibleQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  options: Record<AnswerOption, string>;
  correctAnswer: AnswerOption;
  difficulty: Difficulty;
  explanation: string;
}

export type CellState = "empty" | "ship" | "hit" | "miss" | "sunk";

export interface Cell {
  x: number;
  y: number;
  state: CellState;
  shipId?: string;
}

export interface Ship {
  id: string;
  size: number;
  cells: { x: number; y: number }[];
  hits: number;
  sunk: boolean;
  orientation: "horizontal" | "vertical";
}

export interface PlayerBoard {
  cells: Cell[][];
  ships: Ship[];
}

export type GamePhase =
  | "menu"
  | "setup"
  | "placement"
  | "quiz"
  | "battle"
  | "gameover";

export type GameMode = "ai" | "hotseat";

export type AIDifficulty = "easy" | "medium" | "hard";

export type QuestionMode = QuestionCategory | "mixed";

export type HintType = "fifty-fifty" | "scripture";

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
  currentStreak: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: string;
  mode: GameMode;
}

export interface UnlockableShip {
  id: string;
  name: string;
  description: string;
  requiredWins: number;
  unlocked: boolean;
}

export interface UnlockableTheme {
  id: string;
  name: string;
  description: string;
  requiredCorrect: number;
  unlocked: boolean;
}

export const BOARD_SIZE = 8;

/** 6 кораблей для поля 8×8: 1×3, 2×2, 3×1 */
export const FLEET_CONFIG = [
  { size: 3, count: 1 },
  { size: 2, count: 2 },
  { size: 1, count: 3 },
] as const;

export const FLEET_SHIP_COUNT = FLEET_CONFIG.reduce((n, { count }) => n + count, 0);

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  "old-testament": "Ветхий Завет",
  "new-testament": "Новый Завет",
  "psalms-proverbs": "Псалмы и Притчи",
  general: "Общие вопросы",
};

export const CATEGORY_ICONS: Record<QuestionCategory, string> = {
  "old-testament": "📜",
  "new-testament": "✝️",
  "psalms-proverbs": "🎵",
  general: "📖",
};
