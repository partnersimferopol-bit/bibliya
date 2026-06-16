"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ShareInviteButtons from "@/components/menu/ShareInviteButtons";
import { useGameStore } from "@/store/gameStore";
import {
  AIDifficulty,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  QuestionMode,
} from "@/types";

interface SetupScreenProps {
  onBack: () => void;
}

type OpponentMode = "ai" | "friend";

const categories: { id: QuestionMode; label: string; featured?: boolean }[] = [
  { id: "kids-quiz", label: `${CATEGORY_ICONS["kids-quiz"]} ${CATEGORY_LABELS["kids-quiz"]}`, featured: true },
  { id: "mixed", label: "🎲 Смешанный режим" },
  { id: "old-testament", label: `${CATEGORY_ICONS["old-testament"]} ${CATEGORY_LABELS["old-testament"]}` },
  { id: "new-testament", label: `${CATEGORY_ICONS["new-testament"]} ${CATEGORY_LABELS["new-testament"]}` },
  { id: "psalms-proverbs", label: `${CATEGORY_ICONS["psalms-proverbs"]} ${CATEGORY_LABELS["psalms-proverbs"]}` },
];

export default function SetupScreen({ onBack }: SetupScreenProps) {
  const startGame = useGameStore((s) => s.startGame);
  const [opponent, setOpponent] = useState<OpponentMode>("ai");
  const [aiDiff, setAiDiff] = useState<AIDifficulty>("medium");
  const [qMode, setQMode] = useState<QuestionMode>("kids-quiz");
  const [name, setName] = useState("Капитан");

  const handleStart = () => {
    if (opponent === "ai") {
      startGame("ai", qMode, aiDiff, name || "Капитан");
    } else {
      startGame("hotseat", qMode, aiDiff, name || "Капитан");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 scroll-border rounded-xl w-full">
      <h2 className="text-2xl text-gold-400 font-display mb-2 text-center">
        Настройка игры
      </h2>
      <p className="text-parchment/60 text-sm text-center mb-6">
        Выберите категорию вопросов и соперника
      </p>

      <p className="text-gold-400 mb-2">Противник</p>
      <div className="flex gap-2 mb-6">
        <Button
          variant={opponent === "ai" ? "primary" : "secondary"}
          size="sm"
          className="flex-1"
          onClick={() => setOpponent("ai")}
        >
          🤖 ИИ
        </Button>
        <Button
          variant={opponent === "friend" ? "primary" : "secondary"}
          size="sm"
          className="flex-1"
          onClick={() => setOpponent("friend")}
        >
          👥 Пригласить друга
        </Button>
      </div>

      {opponent === "ai" ? (
        <p className="text-parchment/70 text-sm text-center mb-4">
          Верный ответ — выстрел; неверный — следующий вопрос
        </p>
      ) : (
        <>
          <ShareInviteButtons />
          <p className="text-parchment/70 text-sm text-center mb-4">
            Играйте вдвоём на одном устройстве по очереди. Друг может открыть
            ссылку у себя и сыграть отдельно.
          </p>
        </>
      )}

      <label className="block mb-4">
        <span className="text-parchment/80 text-sm">Ваше имя</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded bg-sea-900 border border-gold-600/40 text-parchment"
        />
      </label>

      {opponent === "ai" && (
        <>
          <p className="text-gold-400 mb-2">Сложность противника</p>
          <div className="flex gap-2 mb-6">
            {(["easy", "medium", "hard"] as AIDifficulty[]).map((d) => (
              <Button
                key={d}
                variant={aiDiff === d ? "primary" : "secondary"}
                size="sm"
                className="flex-1"
                onClick={() => setAiDiff(d)}
              >
                {d === "easy" ? "Лёгкий" : d === "medium" ? "Средний" : "Сложный"}
              </Button>
            ))}
          </div>
        </>
      )}

      <p className="text-gold-400 mb-2">Категория вопросов</p>
      <div className="flex flex-col gap-2 mb-8">
        {categories.map((c) => (
          <Button
            key={c.id}
            variant={qMode === c.id ? "primary" : "secondary"}
            size="sm"
            className={c.featured && qMode !== c.id ? "border-gold-500/40" : ""}
            onClick={() => setQMode(c.id)}
          >
            {c.label}
            {c.featured && (
              <span className="ml-2 text-xs opacity-80 font-normal">· для семьи</span>
            )}
          </Button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Назад
        </Button>
        <Button className="flex-1" onClick={handleStart}>
          Начать расстановку →
        </Button>
      </div>
    </div>
  );
}
