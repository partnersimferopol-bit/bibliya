import type { BibleQuestion, QuestionCategory } from "@/types";
import { oldTestamentQuestions } from "./old-testament";
import { newTestamentQuestions } from "./new-testament";
import { psalmsProverbsQuestions } from "./psalms-proverbs";
import { generalQuestions } from "./general";

export {
  oldTestamentQuestions,
  newTestamentQuestions,
  psalmsProverbsQuestions,
  generalQuestions,
};

export const questionsByCategory: Record<QuestionCategory, BibleQuestion[]> = {
  "old-testament": oldTestamentQuestions,
  "new-testament": newTestamentQuestions,
  "psalms-proverbs": psalmsProverbsQuestions,
  general: generalQuestions,
};

export const allQuestions: BibleQuestion[] = [
  ...oldTestamentQuestions,
  ...newTestamentQuestions,
  ...psalmsProverbsQuestions,
  ...generalQuestions,
];

export default allQuestions;
