"use client";

import { getFleetShips } from "@/lib/game/board";
import Board from "@/components/game/Board";
import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";

export default function PlacementPhase() {
  const {
    mode,
    currentPlayer,
    player1Board,
    player2Board,
    placementShipIndex,
    placementHorizontal,
    message,
    autoPlaceCurrentPlayer,
    tryPlaceShip,
    togglePlacementOrientation,
    finishPlacement,
  } = useGameStore();

  const activeBoard =
    mode === "hotseat" && currentPlayer === 2 ? player2Board : player1Board;

  const fleet = getFleetShips();
  const currentShip = fleet[placementShipIndex];
  const view = activeBoard.cells.map((row) =>
    row.map(
      (c) => (c.state === "ship" ? "ship" : c.state) as "empty" | "ship" | "hit" | "miss" | "sunk"
    )
  );

  const playerLabel =
    mode === "hotseat" ? `Игрок ${currentPlayer}` : "Ваше поле";

  return (
    <div className="game-screen flex flex-col items-center gap-3 sm:gap-4 p-2 sm:p-4 pb-safe">
      <p className="text-gold-400 text-center max-w-xl text-sm sm:text-base px-2">{message}</p>
      {currentShip && (
        <p className="text-xs sm:text-sm text-parchment/80 text-center">
          {playerLabel} · корабль {placementShipIndex + 1}/{fleet.length}: {currentShip.size} кл. ·{" "}
          {placementHorizontal ? "→" : "↓"}
        </p>
      )}
      <div className="board-scroll w-full flex justify-center overflow-x-auto overscroll-x-contain px-1">
        <Board
          cells={view}
          interactive
          showShips
          ownBoard
          onCellClick={(x, y) => tryPlaceShip(x, y)}
          label={`${playerLabel} — 15×15`}
        />
      </div>
      <div className="flex flex-wrap gap-2 justify-center w-full max-w-md px-2">
        <Button variant="secondary" size="sm" className="flex-1 min-w-[120px] min-h-[44px]" onClick={togglePlacementOrientation}>
          ↻ Повернуть
        </Button>
        <Button variant="secondary" size="sm" className="flex-1 min-w-[120px] min-h-[44px]" onClick={autoPlaceCurrentPlayer}>
          🎲 Авто
        </Button>
        <Button size="sm" className="flex-1 min-w-[120px] min-h-[44px]" onClick={finishPlacement}>
          ✓ Готово
        </Button>
      </div>
    </div>
  );
}
