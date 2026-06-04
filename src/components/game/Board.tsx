"use client";

import { motion } from "framer-motion";
import { CellState } from "@/types";
import { BOARD_SIZE } from "@/types";

interface BoardProps {
  cells: CellState[][];
  onCellClick?: (x: number, y: number) => void;
  interactive?: boolean;
  showShips?: boolean;
  ownBoard?: boolean;
  lastShot?: { x: number; y: number } | null;
  label?: string;
}

function cellColor(state: CellState, showShip: boolean): string {
  if (state === "ship" && showShip) return "ship-cell";
  switch (state) {
    case "hit":
      return "bg-red-700 border-red-400";
    case "miss":
      return "bg-sea-600/60 border-sea-500";
    case "sunk":
      return "bg-red-900 border-red-600";
    default:
      return "bg-sea-800/40 border-sea-600/30 hover:bg-sea-700/50 active:bg-sea-600/60";
  }
}

export default function Board({
  cells,
  onCellClick,
  interactive = false,
  showShips = false,
  ownBoard = false,
  lastShot,
  label,
}: BoardProps) {
  return (
    <div className="board-wrapper w-full flex flex-col items-center">
      {label && (
        <p className="text-xs sm:text-sm text-parchment/70 mb-2 text-center">{label}</p>
      )}
      <div
        className="board-frame inline-block p-1.5 sm:p-2 scroll-border rounded-lg bg-sea-900/30 max-w-full"
        style={{ "--board-cols": BOARD_SIZE } as React.CSSProperties}
      >
        <div className="battle-board-grid gap-px">
          {cells.map((row, y) =>
            row.map((state, x) => {
              const displayState =
                state === "ship" && !showShips && !ownBoard ? "empty" : state;
              const isLast = lastShot?.x === x && lastShot?.y === y;
              const disabled =
                !interactive ||
                displayState === "hit" ||
                displayState === "miss" ||
                displayState === "sunk";

              return (
                <motion.button
                  key={`${x}-${y}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onCellClick?.(x, y)}
                  className={`battle-board-cell cell-btn rounded-sm touch-manipulation ${cellColor(
                    displayState,
                    showShips || ownBoard
                  )}`}
                  animate={
                    isLast
                      ? { scale: [1, 1.35, 1], transition: { duration: 0.35 } }
                      : {}
                  }
                >
                  {(displayState === "hit" || displayState === "sunk") && (
                    <span className="board-cell-icon">💥</span>
                  )}
                  {displayState === "miss" && (
                    <span className="board-cell-icon opacity-60">•</span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
