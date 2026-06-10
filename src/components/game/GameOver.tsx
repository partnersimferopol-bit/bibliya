"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";

export default function GameOver() {
  const { winner, message, sessionCorrect, sessionTotal, resetToMenu, mode, playerName } =
    useGameStore();

  const pct =
    sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-md mx-auto p-8 scroll-border rounded-xl text-center"
    >
      <div className="text-5xl mb-4">{winner === 1 ? "🏆" : "⚓"}</div>
      <h2 className="text-3xl text-gold-400 font-display mb-2">
        {mode === "hotseat" && winner
          ? `Игрок ${winner} победил!`
          : message}
      </h2>
      {mode !== "hotseat" && (
        <p className="text-parchment/80 mb-6">
          {playerName}: {sessionCorrect} из {sessionTotal} верных ответов ({pct}%)
        </p>
      )}
      {mode === "hotseat" && (
        <p className="text-parchment/80 mb-6">
          Верных ответов за партию: {sessionCorrect} из {sessionTotal} ({pct}%)
        </p>
      )}
      <Button size="lg" onClick={resetToMenu}>
        В главное меню
      </Button>
    </motion.div>
  );
}
