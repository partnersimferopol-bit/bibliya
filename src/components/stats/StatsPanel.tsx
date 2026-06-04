"use client";

import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";

interface StatsPanelProps {
  onBack: () => void;
}

export default function StatsPanel({ onBack }: StatsPanelProps) {
  const { stats, leaderboard } = useGameStore();
  const accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
      : 0;

  return (
    <div className="max-w-lg mx-auto p-6 scroll-border rounded-xl">
      <h2 className="text-2xl text-gold-400 font-display mb-6 text-center">
        📊 Статистика
      </h2>
      <ul className="space-y-3 text-parchment mb-8">
        <li>Игр сыграно: <strong className="text-gold-400">{stats.gamesPlayed}</strong></li>
        <li>Побед: <strong className="text-gold-400">{stats.gamesWon}</strong></li>
        <li>Всего вопросов: <strong>{stats.totalQuestions}</strong></li>
        <li>Верных ответов: <strong>{stats.correctAnswers}</strong> ({accuracy}%)</li>
        <li>Лучшая серия: <strong>{stats.bestStreak}</strong></li>
      </ul>

      <h3 className="text-gold-400 mb-3">🏆 Таблица лидеров</h3>
      {leaderboard.length === 0 ? (
        <p className="text-parchment/60 text-sm mb-6">Пока пусто — сыграйте первый бой!</p>
      ) : (
        <ol className="text-sm space-y-1 mb-6 max-h-48 overflow-y-auto">
          {leaderboard.map((e, i) => (
            <li key={e.id} className="flex justify-between border-b border-sea-700/50 py-1">
              <span>
                {i + 1}. {e.name}
              </span>
              <span className="text-gold-400">{e.score}</span>
            </li>
          ))}
        </ol>
      )}

      <Button onClick={onBack}>← Назад</Button>
    </div>
  );
}
