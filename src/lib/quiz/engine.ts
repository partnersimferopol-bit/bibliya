import {
  AnswerOption,
  BibleQuestion,
  HintType,
  QuestionCategory,
  QuestionMode,
} from "@/types";
import { allQuestions, questionsByCategory } from "@/data/questions";

export function getQuestionsByMode(mode: QuestionMode): BibleQuestion[] {
  if (mode === "mixed") return [...allQuestions];
  return [...questionsByCategory[mode]];
}

export function getRandomQuestion(
  mode: QuestionMode,
  usedIds: Set<string>
): BibleQuestion | null {
  const pool = getQuestionsByMode(mode).filter((q) => !usedIds.has(q.id));
  if (pool.length === 0) {
    const full = getQuestionsByMode(mode);
    return full[Math.floor(Math.random() * full.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** @deprecated используйте pickFiftyFiftyDisplayKeys с перемешанными вариантами */
export function applyFiftyFifty(question: BibleQuestion): AnswerOption[] {
  const wrong = (["A", "B", "C", "D"] as AnswerOption[]).filter(
    (o) => o !== question.correctAnswer
  );
  return wrong.sort(() => Math.random() - 0.5).slice(0, 2);
}

export function applyScriptureHint(question: BibleQuestion): string {
  const parts = question.explanation.split("—");
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return question.explanation.slice(0, 60) + "...";
}

export function checkAnswer(
  question: BibleQuestion,
  answer: AnswerOption
): boolean {
  return question.correctAnswer === answer;
}

export function getCategoryCount(category: QuestionCategory): number {
  return questionsByCategory[category].length;
}

export const HINT_LIMITS: Record<HintType, number> = {
  "fifty-fifty": 3,
  scripture: 3,
};
