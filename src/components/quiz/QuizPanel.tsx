"use client";

import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";
import { HINT_LIMITS } from "@/lib/quiz/engine";

export default function QuizPanel() {
  const {
    currentQuestion,
    displayOptions,
    answerQuestion,
    hiddenOptions,
    hintsUsed,
    scriptureHint,
    useHint,
    message,
  } = useGameStore();

  if (!currentQuestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-4 sm:p-6 scroll-border rounded-xl bg-sea-900/50 quiz-panel"
    >
      <p className="text-sm text-gold-500 mb-2">Ваш ход — ответьте на вопрос</p>
      <h3 className="text-base sm:text-lg md:text-xl text-parchment mb-4 sm:mb-6 leading-relaxed">
        {currentQuestion.question}
      </h3>

      <div className="grid gap-2 sm:gap-3 mb-4">
        {displayOptions.map((opt) => {
          if (hiddenOptions.includes(opt.displayKey)) return null;
          return (
            <Button
              key={opt.displayKey}
              variant="secondary"
              className="text-left justify-start w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base touch-manipulation"
              onClick={() => answerQuestion(opt.displayKey)}
            >
              <span className="text-gold-500 font-bold mr-2">{opt.displayKey}.</span>
              {opt.text}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px] touch-manipulation"
          disabled={hintsUsed["fifty-fifty"] >= HINT_LIMITS["fifty-fifty"]}
          onClick={() => useHint("fifty-fifty")}
        >
          50/50 ({HINT_LIMITS["fifty-fifty"] - hintsUsed["fifty-fifty"]})
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px] touch-manipulation"
          disabled={hintsUsed.scripture >= HINT_LIMITS.scripture}
          onClick={() => useHint("scripture")}
        >
          📜 Помощь ({HINT_LIMITS.scripture - hintsUsed.scripture})
        </Button>
      </div>

      <AnimatePresence>
        {scriptureHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gold-300/90 italic border-l-2 border-gold-500 pl-3"
          >
            {scriptureHint}
          </motion.p>
        )}
      </AnimatePresence>

      {message && (
        <p className="mt-4 text-center text-parchment/70 text-sm">{message}</p>
      )}
    </motion.div>
  );
}
