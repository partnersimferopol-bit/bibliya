import {
  BOARD_SIZE,
  Cell,
  CellState,
  FLEET_CONFIG,
  PlayerBoard,
  Ship,
} from "@/types";

export function createEmptyBoard(): PlayerBoard {
  const cells: Cell[][] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      row.push({ x, y, state: "empty" });
    }
    cells.push(row);
  }
  return { cells, ships: [] };
}

export function getFleetShips(): { size: number; id: string }[] {
  const ships: { size: number; id: string }[] = [];
  FLEET_CONFIG.forEach(({ size, count }) => {
    for (let i = 0; i < count; i++) {
      ships.push({ size, id: `ship-${size}-${i}` });
    }
  });
  return ships;
}

function isValidPlacement(
  board: PlayerBoard,
  x: number,
  y: number,
  size: number,
  horizontal: boolean
): boolean {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    const cx = horizontal ? x + i : x;
    const cy = horizontal ? y : y + i;
    if (cx >= BOARD_SIZE || cy >= BOARD_SIZE) return false;
    cells.push({ x: cx, y: cy });
  }

  for (const cell of cells) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) continue;
        const neighbor = board.cells[ny][nx];
        if (neighbor.state === "ship") return false;
      }
    }
  }
  return true;
}

export function placeShip(
  board: PlayerBoard,
  shipId: string,
  x: number,
  y: number,
  size: number,
  horizontal: boolean
): PlayerBoard | null {
  if (!isValidPlacement(board, x, y, size, horizontal)) return null;

  const newBoard = structuredClone(board);
  const shipCells: { x: number; y: number }[] = [];

  for (let i = 0; i < size; i++) {
    const cx = horizontal ? x + i : x;
    const cy = horizontal ? y : y + i;
    newBoard.cells[cy][cx] = {
      x: cx,
      y: cy,
      state: "ship",
      shipId,
    };
    shipCells.push({ x: cx, y: cy });
  }

  newBoard.ships.push({
    id: shipId,
    size,
    cells: shipCells,
    hits: 0,
    sunk: false,
    orientation: horizontal ? "horizontal" : "vertical",
  });

  return newBoard;
}

export function autoPlaceFleet(board: PlayerBoard): PlayerBoard {
  let currentBoard = createEmptyBoard();
  const fleet = getFleetShips();

  for (const { size, id } of fleet) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts++;
      const horizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      const result = placeShip(currentBoard, id, x, y, size, horizontal);
      if (result) {
        currentBoard = result;
        placed = true;
      }
    }
    if (!placed) return autoPlaceFleet(createEmptyBoard());
  }
  return currentBoard;
}

export function fireAt(
  board: PlayerBoard,
  x: number,
  y: number
): {
  board: PlayerBoard;
  hit: boolean;
  sunk: boolean;
  shipId?: string;
  alreadyFired: boolean;
} {
  const newBoard = structuredClone(board);
  const cell = newBoard.cells[y][x];

  if (cell.state === "hit" || cell.state === "miss" || cell.state === "sunk") {
    return { board: newBoard, hit: false, sunk: false, alreadyFired: true };
  }

  if (cell.state === "ship" && cell.shipId) {
    cell.state = "hit";
    const ship = newBoard.ships.find((s) => s.id === cell.shipId)!;
    ship.hits++;
    const sunk = ship.hits >= ship.size;
    if (sunk) {
      ship.sunk = true;
      ship.cells.forEach(({ x: sx, y: sy }) => {
        newBoard.cells[sy][sx].state = "sunk";
      });
    }
    return { board: newBoard, hit: true, sunk, shipId: cell.shipId, alreadyFired: false };
  }

  cell.state = "miss";
  return { board: newBoard, hit: false, sunk: false, alreadyFired: false };
}

export function isFleetDestroyed(board: PlayerBoard): boolean {
  return board.ships.every((s) => s.sunk);
}

export function getOpponentView(board: PlayerBoard): CellState[][] {
  return board.cells.map((row) =>
    row.map((cell) => {
      if (cell.state === "ship") return "empty";
      return cell.state;
    })
  );
}

export function countPlacedShips(board: PlayerBoard): number {
  return board.ships.length;
}

export function totalFleetSize(): number {
  return FLEET_CONFIG.reduce((sum, { size, count }) => sum + size * count, 0);
}

export function allShipsPlaced(board: PlayerBoard): boolean {
  return countPlacedShips(board) === getFleetShips().length;
}
