"use client";

import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";

interface CollectionPanelProps {
  onBack: () => void;
}

export default function CollectionPanel({ onBack }: CollectionPanelProps) {
  const unlocks = useGameStore((s) => s.unlocks);

  return (
    <div className="max-w-lg mx-auto p-6 scroll-border rounded-xl">
      <h2 className="text-2xl text-gold-400 font-display mb-6 text-center">
        🚢 Коллекция
      </h2>

      <h3 className="text-gold-400 mb-3">Корабли</h3>
      <ul className="space-y-2 mb-8">
        {unlocks.ships.map((s) => (
          <li
            key={s.id}
            className={`p-3 rounded border ${
              s.unlocked ? "border-gold-500/50 bg-sea-800/40" : "border-sea-700 opacity-50"
            }`}
          >
            <span className="font-bold">{s.unlocked ? "✓" : "🔒"} {s.name}</span>
            <p className="text-sm text-parchment/70">{s.description}</p>
            {!s.unlocked && (
              <p className="text-xs text-gold-600">Нужно побед: {s.requiredWins}</p>
            )}
          </li>
        ))}
      </ul>

      <h3 className="text-gold-400 mb-3">Темы</h3>
      <ul className="space-y-2 mb-8">
        {unlocks.themes.map((t) => (
          <li
            key={t.id}
            className={`p-3 rounded border ${
              t.unlocked ? "border-gold-500/50 bg-sea-800/40" : "border-sea-700 opacity-50"
            }`}
          >
            <span className="font-bold">{t.unlocked ? "✓" : "🔒"} {t.name}</span>
            <p className="text-sm text-parchment/70">{t.description}</p>
            {!t.unlocked && (
              <p className="text-xs text-gold-600">
                Нужно верных ответов: {t.requiredCorrect}
              </p>
            )}
          </li>
        ))}
      </ul>

      <Button onClick={onBack}>← Назад</Button>
    </div>
  );
}
