import { PlayerBoard } from "@/types";
import { BOARD_SIZE } from "@/types";
import { fireAt } from "./board";

type ShotResult = ReturnType<typeof fireAt>;

interface AIState {
  mode: "hunt" | "target";
  targets: { x: number; y: number }[];
  hits: { x: number; y: number }[];
  tried: Set<string>;
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function neighbors(x: number, y: number): { x: number; y: number }[] {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter((c) => c.x >= 0 && c.y >= 0 && c.x < BOARD_SIZE && c.y < BOARD_SIZE);
}

function randomUntriedShot(tried: Set<string>): { x: number; y: number } {
  const available: { x: number; y: number }[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (!tried.has(key(x, y))) available.push({ x, y });
    }
  }
  return available[Math.floor(Math.random() * available.length)];
}

function parityShot(tried: Set<string>): { x: number; y: number } {
  const available: { x: number; y: number }[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (!tried.has(key(x, y)) && (x + y) % 2 === 0) available.push({ x, y });
    }
  }
  if (available.length === 0) return randomUntriedShot(tried);
  return available[Math.floor(Math.random() * available.length)];
}

function smartTargetShot(state: AIState): { x: number; y: number } {
  if (state.targets.length > 0) {
    const idx = Math.floor(Math.random() * state.targets.length);
    return state.targets.splice(idx, 1)[0];
  }

  if (state.hits.length >= 2) {
    const sorted = [...state.hits].sort((a, b) =>
      a.x === b.x ? a.y - b.y : a.x - b.x
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const horizontal = first.y === last.y;
    const candidates: { x: number; y: number }[] = [];

    if (horizontal) {
      candidates.push({ x: first.x - 1, y: first.y }, { x: last.x + 1, y: last.y });
    } else {
      candidates.push({ x: first.x, y: first.y - 1 }, { x: last.x, y: last.y + 1 });
    }

    for (const c of candidates) {
      if (
        c.x >= 0 &&
        c.y >= 0 &&
        c.x < BOARD_SIZE &&
        c.y < BOARD_SIZE &&
        !state.tried.has(key(c.x, c.y))
      ) {
        return c;
      }
    }
  }

  if (state.hits.length === 1) {
    const hit = state.hits[0];
    const adj = neighbors(hit.x, hit.y).filter(
      (c) => !state.tried.has(key(c.x, c.y))
    );
    if (adj.length > 0) return adj[Math.floor(Math.random() * adj.length)];
  }

  return parityShot(state.tried);
}

export class BattleshipAI {
  private state: AIState = {
    mode: "hunt",
    targets: [],
    hits: [],
    tried: new Set(),
  };
  difficulty: "easy" | "medium" | "hard";

  constructor(difficulty: "easy" | "medium" | "hard" = "medium") {
    this.difficulty = difficulty;
  }

  reset(): void {
    this.state = { mode: "hunt", targets: [], hits: [], tried: new Set() };
  }

  getNextShot(): { x: number; y: number } {
    let shot: { x: number; y: number };

    switch (this.difficulty) {
      case "easy":
        shot = randomUntriedShot(this.state.tried);
        break;
      case "medium":
        shot =
          this.state.mode === "target"
            ? smartTargetShot(this.state)
            : parityShot(this.state.tried);
        break;
      case "hard":
        shot = smartTargetShot(this.state);
        break;
    }

    this.state.tried.add(key(shot.x, shot.y));
    return shot;
  }

  registerShotResult(result: ShotResult, x: number, y: number): void {
    if (result.sunk) {
      this.state.mode = "hunt";
      this.state.hits = [];
      this.state.targets = [];
    } else if (result.hit) {
      this.state.mode = "target";
      this.state.hits.push({ x, y });
      neighbors(x, y).forEach((n) => {
        if (!this.state.tried.has(key(n.x, n.y))) {
          this.state.targets.push(n);
        }
      });
    }
  }

  /** AI answers quiz — probability based on difficulty */
  answerCorrectly(questionDifficulty: string): boolean {
    const rates: Record<string, Record<string, number>> = {
      easy: { easy: 0.85, medium: 0.65, hard: 0.45 },
      medium: { easy: 0.95, medium: 0.8, hard: 0.6 },
      hard: { easy: 0.98, medium: 0.92, hard: 0.78 },
    };
    const rate =
      rates[this.difficulty][questionDifficulty] ?? 0.5;
    return Math.random() < rate;
  }
}

export function simulateAIShot(
  ai: BattleshipAI,
  board: PlayerBoard
): { x: number; y: number; result: ReturnType<typeof fireAt> } {
  const { x, y } = ai.getNextShot();
  const result = fireAt(board, x, y);
  ai.registerShotResult(result, x, y);
  return { x, y, result };
}
