"use client";

import { motion } from "framer-motion";
import Board from "@/components/game/Board";
import QuizPanel from "@/components/quiz/QuizPanel";
import { getOpponentView } from "@/lib/game/board";
import { useGameStore } from "@/store/gameStore";

export default function BattlePhase() {
  const {
    phase,
    mode,
    currentPlayer,
    player1Board,
    player2Board,
    showOpponentBoard,
    shoot,
    lastShot,
    message,
    currentQuestion,
    lastExplanation,
  } = useGameStore();

  const ownBoard = currentPlayer === 1 ? player1Board : player2Board;
  const enemyBoard = currentPlayer === 1 ? player2Board : player1Board;
  const enemyView = getOpponentView(enemyBoard);
  const ownView = ownBoard.cells.map((row) => row.map((c) => c.state));

  const turnLabel =
    mode === "hotseat"
      ? `Игрок ${currentPlayer}`
      : currentPlayer === 1
        ? "Ваш ход"
        : "Ход противника";

  return (
    <div className="game-screen p-2 sm:p-4 max-w-7xl mx-auto pb-safe">
      <p className="text-center text-gold-400 mb-3 sm:mb-4 text-sm sm:text-base px-2">
        {turnLabel}
        {message ? ` · ${message}` : ""}
      </p>

      {phase === "quiz" && currentQuestion && (
        <div className="mb-4">
          <QuizPanel />
        </div>
      )}

      {phase === "quiz" && !currentQuestion && message && (
        <div className="max-w-xl mx-auto p-4 sm:p-6 text-center scroll-border rounded-xl mb-4">
          <p className="text-base sm:text-lg text-gold-300 mb-3">{message}</p>
          {lastExplanation && (
            <p className="text-sm text-parchment/80 italic">📖 {lastExplanation}</p>
          )}
          <p className="text-parchment/60 text-sm mt-4">Следующий вопрос...</p>
        </div>
      )}

      {lastExplanation && phase === "battle" && (
        <p className="text-center text-xs sm:text-sm text-gold-300/80 italic max-w-xl mx-auto mb-3 px-3">
          📖 {lastExplanation}
        </p>
      )}

      {phase === "battle" && showOpponentBoard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center mb-6"
        >
          <p className="mb-2 text-parchment/80 text-sm text-center">Поле противника — нажмите клетку</p>
          <div className="board-scroll w-full flex justify-center overflow-x-auto overscroll-x-contain px-1">
            <Board
              cells={enemyView}
              interactive
              onCellClick={shoot}
              lastShot={lastShot}
              label="Выстрел"
            />
          </div>
        </motion.div>
      )}

      <div className="flex flex-col items-center border-t border-gold-600/20 pt-4 sm:pt-6">
        <div className="board-scroll w-full flex justify-center overflow-x-auto overscroll-x-contain px-1">
          <Board cells={ownView} showShips ownBoard label="Ваш флот" />
        </div>
      </div>
    </div>
  );
}
