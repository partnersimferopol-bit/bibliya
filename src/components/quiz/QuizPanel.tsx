"use client";

import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { useGameStore } from "@/store/gameStore";
import { HINT_LIMITS } from "@/lib/quiz/engine";
import { assetPath } from "@/lib/assetPath";

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

  const isKids = currentQuestion.category === "kids-quiz";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full mx-auto p-4 sm:p-6 scroll-border rounded-xl bg-sea-900/50 quiz-panel ${
        isKids ? "max-w-3xl" : "max-w-2xl"
      }`}
    >
      <p className="text-sm text-gold-500 mb-2">
        {isKids ? "🧒 Детская викторина — выберите картинку-ответ" : "Ваш ход — ответьте на вопрос"}
      </p>

      {isKids && currentQuestion.title && (
        <p className="text-gold-400 font-display text-lg mb-2 text-center">
          {currentQuestion.title}
        </p>
      )}

      {isKids && currentQuestion.image && (
        <div className="mb-4 flex justify-center">
          <img
            src={assetPath(currentQuestion.image)}
            alt={currentQuestion.title ?? "Вопрос"}
            className="kids-quiz-main-image rounded-lg border-2 border-gold-600/50 shadow-lg max-h-[40vh] w-auto object-contain bg-sea-950/50"
          />
        </div>
      )}

      <h3 className="text-base sm:text-lg md:text-xl text-parchment mb-4 sm:mb-6 leading-relaxed text-center">
        {currentQuestion.question}
      </h3>

      {isKids ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
          {displayOptions.map((opt) => {
            if (hiddenOptions.includes(opt.displayKey)) return null;
            return (
              <button
                key={opt.displayKey}
                type="button"
                onClick={() => answerQuestion(opt.displayKey)}
                className="kids-quiz-option touch-manipulation rounded-lg border-2 border-gold-600/40 bg-sea-800/60 p-1.5 sm:p-2 hover:border-gold-400 hover:bg-sea-700/70 transition-colors"
              >
                <span className="block text-gold-500 font-bold text-sm mb-1">
                  {opt.displayKey}
                </span>
                {opt.image ? (
                  <img
                    src={assetPath(opt.image)}
                    alt={`Вариант ${opt.displayKey}`}
                    className="w-full h-auto max-h-32 sm:max-h-40 object-contain rounded"
                  />
                ) : (
                  <span className="text-xs text-parchment/80">{opt.text}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
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
      )}

      {!isKids && (
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
      )}

      <AnimatePresence>
        {scriptureHint && !isKids && (
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
