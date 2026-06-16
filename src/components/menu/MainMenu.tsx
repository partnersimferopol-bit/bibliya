"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import DonateLink from "@/components/menu/DonateLink";
import LegalFooterLinks from "@/components/menu/LegalFooterLinks";
import { useGameStore } from "@/store/gameStore";

interface MainMenuProps {
  onKidsPlay: () => void;
  onPlay: () => void;
  onStats: () => void;
  onCollection: () => void;
}

export default function MainMenu({ onKidsPlay, onPlay, onStats, onCollection }: MainMenuProps) {
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
        📖 ✝️
      </motion.div>
      <h1 className="text-3xl md:text-5xl font-display text-gold-400 mb-2 drop-shadow-lg">
        Библейская Битва
      </h1>
      <p className="text-xl md:text-2xl text-gold-300/90 mb-2 font-display">
        Семейная викторина с соревнованием
      </p>
      <p className="text-parchment/70 max-w-md mb-8 text-sm md:text-base">
        Отвечайте на вопросы из Библии — за верный ответ выстрел по флоту соперника
      </p>

      <div className="wave-bg absolute inset-0 pointer-events-none opacity-30 -z-10" />

      <div className="kids-feature-card w-full max-w-sm mb-6 p-4 sm:p-5 rounded-xl scroll-border bg-sea-900/60 text-left">
        <p className="text-gold-400 font-display text-lg sm:text-xl mb-1">
          🧒 Детская викторина
        </p>
        <p className="text-parchment/70 text-sm mb-4 leading-relaxed">
          50 вопросов с картинками — играйте всей семьёй или на воскресной школе
        </p>
        <Button size="lg" onClick={onKidsPlay}>
          Играть с детьми
        </Button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="secondary" onClick={onPlay}>
          📚 Другие режимы
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

      <DonateLink variant="text" className="mt-6" />

      <LegalFooterLinks className="mt-4 max-w-xs" />
    </motion.div>
  );
}
