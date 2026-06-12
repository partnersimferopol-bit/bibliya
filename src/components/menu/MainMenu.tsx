"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";

interface MainMenuProps {
  onPlay: () => void;
  onStats: () => void;
  onCollection: () => void;
}

export default function MainMenu({ onPlay, onStats, onCollection }: MainMenuProps) {
  const stats = useGameStore((s) => s.stats);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="text-6xl mb-4"
      >
        ⚓ ✝️
      </motion.div>
      <h1 className="text-3xl md:text-5xl font-display text-gold-400 mb-2 drop-shadow-lg">
        Морской бой
      </h1>
      <p className="text-xl md:text-2xl text-gold-300/90 mb-1 font-display">
        Библейская Битва
      </p>
      <p className="text-parchment/70 max-w-md mb-8 text-sm md:text-base">
        Поле 8×8 · 6 кораблей · Викторина перед выстрелом
      </p>

      <div className="wave-bg absolute inset-0 pointer-events-none opacity-30 -z-10" />

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button size="lg" onClick={onPlay}>
          ⚔️ В бой
        </Button>
        <Button variant="secondary" onClick={onStats}>
          📊 Статистика
        </Button>
        <Button variant="secondary" onClick={onCollection}>
          🚢 Коллекция
        </Button>
      </div>

      {stats.gamesPlayed > 0 && (
        <p className="mt-8 text-sm text-parchment/60">
          Игр: {stats.gamesPlayed} · Побед: {stats.gamesWon} · Верных ответов:{" "}
          {stats.correctAnswers}
        </p>
      )}
    </motion.div>
  );
}
