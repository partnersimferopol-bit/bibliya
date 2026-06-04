import {
  GameStats,
  LeaderboardEntry,
  UnlockableShip,
  UnlockableTheme,
} from "@/types";

const STATS_KEY = "bible-battleship-stats";
const LEADERBOARD_KEY = "bible-battleship-leaderboard";
const UNLOCKS_KEY = "bible-battleship-unlocks";

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  bestStreak: 0,
  currentStreak: 0,
};

export const DEFAULT_SHIPS: UnlockableShip[] = [
  { id: "ark", name: "Ковчег Ноя", description: "5 клеток — символ спасения", requiredWins: 0, unlocked: true },
  { id: "jonah", name: "Кит Ионы", description: "Победа в 3 играх", requiredWins: 3, unlocked: false },
  { id: "moses", name: "Ковчег завета", description: "Победа в 5 играх", requiredWins: 5, unlocked: false },
  { id: "paul", name: "Корабль Павла", description: "Победа в 10 играх", requiredWins: 10, unlocked: false },
  { id: "solomon", name: "Флот Соломона", description: "Победа в 20 играх", requiredWins: 20, unlocked: false },
];

export const DEFAULT_THEMES: UnlockableTheme[] = [
  { id: "classic", name: "Классическое море", description: "Стандартная тема", requiredCorrect: 0, unlocked: true },
  { id: "desert", name: "Пустыня Синай", description: "50 правильных ответов", requiredCorrect: 50, unlocked: false },
  { id: "temple", name: "Храм Соломона", description: "100 правильных ответов", requiredCorrect: 100, unlocked: false },
  { id: "heaven", name: "Небесный Сион", description: "200 правильных ответов", requiredCorrect: 200, unlocked: false },
];

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadStats(): GameStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  return safeParse(localStorage.getItem(STATS_KEY), DEFAULT_STATS);
}

export function saveStats(stats: GameStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(LEADERBOARD_KEY), []);
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  const list = loadLeaderboard();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, 20)));
}

export function loadUnlocks(): {
  ships: UnlockableShip[];
  themes: UnlockableTheme[];
} {
  if (typeof window === "undefined") {
    return { ships: DEFAULT_SHIPS, themes: DEFAULT_THEMES };
  }
  const data = safeParse(localStorage.getItem(UNLOCKS_KEY), {
    ships: DEFAULT_SHIPS,
    themes: DEFAULT_THEMES,
  });
  return data;
}

export function saveUnlocks(ships: UnlockableShip[], themes: UnlockableTheme[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify({ ships, themes }));
}

export function updateUnlocks(stats: GameStats): {
  ships: UnlockableShip[];
  themes: UnlockableTheme[];
} {
  const { ships, themes } = loadUnlocks();
  const newShips = ships.map((s) => ({
    ...s,
    unlocked: s.unlocked || stats.gamesWon >= s.requiredWins,
  }));
  const newThemes = themes.map((t) => ({
    ...t,
    unlocked: t.unlocked || stats.correctAnswers >= t.requiredCorrect,
  }));
  saveUnlocks(newShips, newThemes);
  return { ships: newShips, themes: newThemes };
}

export function computeScore(
  won: boolean,
  correct: number,
  total: number,
  turns: number
): number {
  const base = won ? 1000 : 200;
  const accuracy = total > 0 ? Math.round((correct / total) * 500) : 0;
  const speed = Math.max(0, 300 - turns * 5);
  return base + accuracy + speed;
}
