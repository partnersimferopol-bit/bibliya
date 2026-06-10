"use client";

import { create } from "zustand";
import {
  AIDifficulty,
  AnswerOption,
  BibleQuestion,
  GameMode,
  GamePhase,
  GameStats,
  HintType,
  LeaderboardEntry,
  PlayerBoard,
  QuestionMode,
  UnlockableShip,
  UnlockableTheme,
} from "@/types";
import {
  allShipsPlaced,
  autoPlaceFleet,
  createEmptyBoard,
  fireAt,
  getFleetShips,
  isFleetDestroyed,
  placeShip,
} from "@/lib/game/board";
import { BattleshipAI } from "@/lib/game/ai";
import {
  applyScriptureHint,
  getRandomQuestion,
  HINT_LIMITS,
} from "@/lib/quiz/engine";
import {
  DisplayOption,
  isDisplayAnswerCorrect,
  pickFiftyFiftyDisplayKeys,
  shuffleQuestionOptions,
} from "@/lib/quiz/shuffleOptions";
import {
  addLeaderboardEntry,
  computeScore,
  loadLeaderboard,
  loadStats,
  loadUnlocks,
  saveStats,
  updateUnlocks,
  DEFAULT_STATS,
} from "@/lib/storage/persistence";

interface GameStore {
  phase: GamePhase;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  questionMode: QuestionMode;
  currentPlayer: 1 | 2;
  player1Board: PlayerBoard;
  player2Board: PlayerBoard;
  placementShipIndex: number;
  placementHorizontal: boolean;
  currentQuestion: BibleQuestion | null;
  displayOptions: DisplayOption[];
  usedQuestionIds: Set<string>;
  hiddenOptions: AnswerOption[];
  hintsUsed: Record<HintType, number>;
  scriptureHint: string | null;
  lastShot: { x: number; y: number; hit: boolean; sunk: boolean } | null;
  message: string;
  winner: 1 | 2 | null;
  stats: GameStats;
  leaderboard: LeaderboardEntry[];
  unlocks: { ships: UnlockableShip[]; themes: UnlockableTheme[] };
  sessionCorrect: number;
  sessionTotal: number;
  turnCount: number;
  ai: BattleshipAI | null;
  playerName: string;
  showOpponentBoard: boolean;
  lastExplanation: string | null;

  initFromStorage: () => void;
  setPhase: (phase: GamePhase) => void;
  startGame: (
    mode: GameMode,
    questionMode: QuestionMode,
    aiDifficulty?: AIDifficulty,
    playerName?: string
  ) => void;
  autoPlaceCurrentPlayer: () => void;
  tryPlaceShip: (x: number, y: number) => boolean;
  togglePlacementOrientation: () => void;
  finishPlacement: () => void;
  loadQuestion: () => void;
  answerQuestion: (answer: AnswerOption) => void;
  shoot: (x: number, y: number) => void;
  useHint: (hint: HintType) => void;
  endGame: (winner: 1 | 2) => void;
  resetToMenu: () => void;
  runAITurn: () => void;
  switchTurnAfterMiss: () => void;
}

function freshBoards() {
  return {
    player1Board: createEmptyBoard(),
    player2Board: createEmptyBoard(),
    placementShipIndex: 0,
    currentPlayer: 1 as const,
    usedQuestionIds: new Set<string>(),
    currentQuestion: null,
    displayOptions: [] as DisplayOption[],
    hiddenOptions: [] as AnswerOption[],
    hintsUsed: { "fifty-fifty": 0, scripture: 0 } as Record<HintType, number>,
    scriptureHint: null,
    lastShot: null,
    message: "",
    winner: null,
    sessionCorrect: 0,
    sessionTotal: 0,
    turnCount: 0,
    showOpponentBoard: false,
    lastExplanation: null,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "menu",
  mode: "ai",
  aiDifficulty: "medium",
  questionMode: "mixed",
  currentPlayer: 1,
  player1Board: createEmptyBoard(),
  player2Board: createEmptyBoard(),
  placementShipIndex: 0,
  placementHorizontal: true,
  currentQuestion: null,
  displayOptions: [],
  usedQuestionIds: new Set(),
  hiddenOptions: [],
  hintsUsed: { "fifty-fifty": 0, scripture: 0 },
  scriptureHint: null,
  lastShot: null,
  message: "",
  winner: null,
  stats: DEFAULT_STATS,
  leaderboard: [],
  unlocks: loadUnlocks(),
  sessionCorrect: 0,
  sessionTotal: 0,
  turnCount: 0,
  ai: null,
  playerName: "Капитан",
  showOpponentBoard: false,
  lastExplanation: null,

  initFromStorage: () => {
    set({
      stats: loadStats(),
      leaderboard: loadLeaderboard(),
      unlocks: loadUnlocks(),
    });
  },

  setPhase: (phase) => set({ phase }),

  startGame: (mode, questionMode, aiDifficulty = "medium", playerName = "Капитан") => {
    if (mode === "hotseat") {
      set({
        ...freshBoards(),
        phase: "placement",
        mode: "hotseat",
        questionMode,
        aiDifficulty,
        ai: null,
        playerName,
        message: "Игрок 1: расставьте флот на поле 15×15 (10 кораблей)",
      });
      return;
    }

    const ai = new BattleshipAI(aiDifficulty);
    const p2 = autoPlaceFleet(createEmptyBoard());
    set({
      ...freshBoards(),
      phase: "placement",
      mode: "ai",
      questionMode,
      aiDifficulty,
      ai,
      playerName,
      player2Board: p2,
      message: "Расставьте свой флот на поле 15×15 (10 кораблей)",
    });
  },

  autoPlaceCurrentPlayer: () => {
    const { currentPlayer, player1Board, player2Board } = get();
    if (currentPlayer === 1) {
      set({ player1Board: autoPlaceFleet(player1Board), placementShipIndex: getFleetShips().length });
    } else {
      set({ player2Board: autoPlaceFleet(player2Board), placementShipIndex: getFleetShips().length });
    }
  },

  tryPlaceShip: (x, y) => {
    const state = get();
    const fleet = getFleetShips();
    if (state.placementShipIndex >= fleet.length) return false;
    const ship = fleet[state.placementShipIndex];
    const board = state.currentPlayer === 1 ? state.player1Board : state.player2Board;
    const result = placeShip(
      board,
      ship.id,
      x,
      y,
      ship.size,
      state.placementHorizontal
    );
    if (!result) return false;
    const key = state.currentPlayer === 1 ? "player1Board" : "player2Board";
    set({
      [key]: result,
      placementShipIndex: state.placementShipIndex + 1,
    } as Partial<GameStore>);
    return true;
  },

  togglePlacementOrientation: () =>
    set((s) => ({ placementHorizontal: !s.placementHorizontal })),

  finishPlacement: () => {
    const state = get();
    const board = state.currentPlayer === 1 ? state.player1Board : state.player2Board;
    if (!allShipsPlaced(board)) {
      set({ message: "Разместите все корабли или нажмите «Авто»" });
      return;
    }

    if (state.mode === "hotseat" && state.currentPlayer === 1) {
      set({
        currentPlayer: 2,
        placementShipIndex: 0,
        placementHorizontal: true,
        message:
          "Игрок 2: расставьте флот. Не показывайте экран первому игроку!",
      });
      return;
    }

    set({
      phase: "quiz",
      currentPlayer: 1,
      message:
        state.mode === "hotseat"
          ? "Игрок 1: ответьте на вопрос, чтобы сделать выстрел"
          : "Ответьте на вопрос, чтобы сделать выстрел",
    });
    get().loadQuestion();
  },

  loadQuestion: () => {
    const { questionMode, usedQuestionIds } = get();
    const q = getRandomQuestion(questionMode, usedQuestionIds);
    if (!q) return;
    const ids = new Set(usedQuestionIds);
    ids.add(q.id);
    set({
      currentQuestion: q,
      displayOptions: shuffleQuestionOptions(q),
      usedQuestionIds: ids,
      hiddenOptions: [],
      scriptureHint: null,
      phase: "quiz",
      showOpponentBoard: false,
    });
  },

  answerQuestion: (answer) => {
    const state = get();
    if (!state.currentQuestion || state.displayOptions.length === 0) return;
    const correct = isDisplayAnswerCorrect(
      state.currentQuestion,
      answer,
      state.displayOptions
    );
    const sessionTotal = state.sessionTotal + 1;
    const sessionCorrect = state.sessionCorrect + (correct ? 1 : 0);
    const stats = { ...state.stats };
    stats.totalQuestions++;
    if (correct) {
      stats.correctAnswers++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
    } else {
      stats.currentStreak = 0;
    }
    saveStats(stats);
    updateUnlocks(stats);

    const explanation = state.currentQuestion.explanation;

    if (!correct) {
      const right = state.currentQuestion.options[state.currentQuestion.correctAnswer];
      set({
        sessionTotal,
        sessionCorrect,
        stats,
        phase: "quiz",
        message: `Неверно. Верный ответ: ${state.currentQuestion.correctAnswer}) ${right}`,
        lastExplanation: explanation,
        currentQuestion: null,
        showOpponentBoard: false,
      });
      setTimeout(() => {
        get().loadQuestion();
      }, 2200);
      return;
    }

    set({
      sessionTotal,
      sessionCorrect,
      stats,
      phase: "battle",
      message:
        state.mode === "hotseat"
          ? `Игрок ${state.currentPlayer}: верно! Выберите клетку`
          : "Верно! Выберите клетку для выстрела",
      lastExplanation: explanation,
      showOpponentBoard: true,
    });
  },

  shoot: (x, y) => {
    const state = get();
    if (state.phase !== "battle" || !state.showOpponentBoard) return;
    const targetBoard =
      state.currentPlayer === 1 ? state.player2Board : state.player1Board;
    const result = fireAt(targetBoard, x, y);
    if (result.alreadyFired) {
      set({ message: "Уже стреляли сюда" });
      return;
    }
    const key = state.currentPlayer === 1 ? "player2Board" : "player1Board";
    set({
      [key]: result.board,
      lastShot: { x, y, hit: result.hit, sunk: result.sunk },
      turnCount: state.turnCount + 1,
      message: result.sunk
        ? "Корабль потоплен!"
        : result.hit
          ? "Попадание!"
          : "Промах!",
    } as Partial<GameStore>);

    const newTarget = get()[key as "player1Board" | "player2Board"];
    if (isFleetDestroyed(newTarget)) {
      get().endGame(state.currentPlayer);
      return;
    }

    if (result.hit) {
      set({ message: "Попадание! Ответьте на следующий вопрос" });
      setTimeout(() => get().loadQuestion(), 1200);
    } else {
      setTimeout(() => get().switchTurnAfterMiss(), 1200);
    }
  },

  useHint: (hint) => {
    const state = get();
    if (!state.currentQuestion || state.hintsUsed[hint] >= HINT_LIMITS[hint]) return;
    if (hint === "fifty-fifty") {
      set({
        hiddenOptions: pickFiftyFiftyDisplayKeys(
          state.currentQuestion,
          state.displayOptions
        ),
        hintsUsed: { ...state.hintsUsed, "fifty-fifty": state.hintsUsed["fifty-fifty"] + 1 },
      });
    } else {
      set({
        scriptureHint: applyScriptureHint(state.currentQuestion),
        hintsUsed: { ...state.hintsUsed, scripture: state.hintsUsed.scripture + 1 },
      });
    }
  },

  switchTurnAfterMiss: () => {
    const state = get();
    const next: 1 | 2 = state.currentPlayer === 1 ? 2 : 1;
    set({
      currentPlayer: next,
      lastShot: null,
      showOpponentBoard: false,
      message:
        state.mode === "hotseat"
          ? `Игрок ${next}: ваш ход`
          : next === 2
            ? "Ход противника (ИИ)"
            : "Ваш ход",
    });
    if (state.mode === "ai" && next === 2) {
      setTimeout(() => get().runAITurn(), 800);
    } else {
      get().loadQuestion();
    }
  },

  runAITurn: () => {
    const state = get();
    if (!state.ai || state.currentPlayer !== 2) return;
    const q = getRandomQuestion(state.questionMode, state.usedQuestionIds);
    if (q) {
      const ids = new Set(state.usedQuestionIds);
      ids.add(q.id);
      const aiCorrect = state.ai.answerCorrectly(q.difficulty);
      set({ usedQuestionIds: ids, currentQuestion: q });
      if (!aiCorrect) {
        set({ message: "ИИ ошибся в вопросе — ход ваш", currentPlayer: 1 });
        setTimeout(() => get().loadQuestion(), 1200);
        return;
      }
    }
    const { x, y, result } = (() => {
      const ai = state.ai!;
      const shot = ai.getNextShot();
      const res = fireAt(state.player1Board, shot.x, shot.y);
      ai.registerShotResult(res, shot.x, shot.y);
      return { x: shot.x, y: shot.y, result: res };
    })();
    set({
      player1Board: result.board,
      lastShot: { x, y, hit: result.hit, sunk: result.sunk },
      turnCount: state.turnCount + 1,
      message: result.sunk ? "ИИ потопил корабль!" : result.hit ? "ИИ попал!" : "ИИ промахнулся",
      showOpponentBoard: false,
    });
    if (isFleetDestroyed(result.board)) {
      get().endGame(2);
      return;
    }
    if (result.hit) {
      setTimeout(() => get().runAITurn(), 1500);
    } else {
      set({ currentPlayer: 1, message: "Ваш ход" });
      setTimeout(() => get().loadQuestion(), 1200);
    }
  },

  endGame: (winner) => {
    const state = get();
    const stats = { ...state.stats };
    stats.gamesPlayed++;
    if (winner === 1) stats.gamesWon++;
    saveStats(stats);
    const unlocks = updateUnlocks(stats);
    const score = computeScore(
      winner === 1,
      state.sessionCorrect,
      state.sessionTotal,
      state.turnCount
    );
    addLeaderboardEntry({
      id: Date.now().toString(),
      name: state.playerName,
      score,
      date: new Date().toLocaleDateString("ru-RU"),
      mode: state.mode,
    });
    set({
      phase: "gameover",
      winner,
      stats,
      unlocks,
      leaderboard: loadLeaderboard(),
      message: winner === 1 ? "Победа!" : "Поражение",
    });
  },

  resetToMenu: () =>
    set({
      phase: "menu",
      ...freshBoards(),
      ai: null,
      currentQuestion: null,
    }),
}));
