import { AnswerOption, BibleQuestion, GamePhase, PlayerBoard } from "@/types";
import { DisplayOption } from "@/lib/quiz/shuffleOptions";

export interface OnlineGameSnapshot {
  player1Board: PlayerBoard;
  player2Board: PlayerBoard;
  currentPlayer: 1 | 2;
  phase: GamePhase;
  message: string;
  showOpponentBoard: boolean;
  winner: 1 | 2 | null;
  currentQuestion: BibleQuestion | null;
  displayOptions: DisplayOption[];
  hiddenOptions: AnswerOption[];
  usedQuestionIds: string[];
}

export function parseOnlineSnapshot(raw: string): OnlineGameSnapshot | null {
  if (!raw || raw === "{}") return null;
  try {
    return JSON.parse(raw) as OnlineGameSnapshot;
  } catch {
    return null;
  }
}

export function buildOnlineSnapshot(state: {
  player1Board: PlayerBoard;
  player2Board: PlayerBoard;
  currentPlayer: 1 | 2;
  phase: GamePhase;
  message: string;
  showOpponentBoard: boolean;
  winner: 1 | 2 | null;
  currentQuestion: BibleQuestion | null;
  displayOptions: DisplayOption[];
  hiddenOptions: AnswerOption[];
  usedQuestionIds: Set<string>;
}): string {
  return JSON.stringify({
    player1Board: state.player1Board,
    player2Board: state.player2Board,
    currentPlayer: state.currentPlayer,
    phase: state.phase,
    message: state.message,
    showOpponentBoard: state.showOpponentBoard,
    winner: state.winner,
    currentQuestion: state.currentQuestion,
    displayOptions: state.displayOptions,
    hiddenOptions: state.hiddenOptions,
    usedQuestionIds: [...state.usedQuestionIds],
  } satisfies OnlineGameSnapshot);
}
