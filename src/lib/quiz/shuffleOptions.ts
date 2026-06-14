import { AnswerOption, BibleQuestion } from "@/types";

export interface DisplayOption {
  /** Буква на кнопке (A–D) */
  displayKey: AnswerOption;
  /** Исходный ключ в данных вопроса */
  sourceKey: AnswerOption;
  text: string;
  image?: string;
}

const ALL_KEYS: AnswerOption[] = ["A", "B", "C", "D"];
const DISPLAY_KEYS: AnswerOption[] = ["A", "B", "C", "D"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Перемешивает варианты — правильный ответ не всегда на первом месте */
export function shuffleQuestionOptions(question: BibleQuestion): DisplayOption[] {
  const sourceOrder = shuffle(ALL_KEYS);
  return DISPLAY_KEYS.map((displayKey, i) => ({
    displayKey,
    sourceKey: sourceOrder[i],
    text: question.options[sourceOrder[i]],
    image: question.optionImages?.[sourceOrder[i]],
  }));
}

export function isDisplayAnswerCorrect(
  question: BibleQuestion,
  displayKey: AnswerOption,
  displayOptions: DisplayOption[]
): boolean {
  const picked = displayOptions.find((o) => o.displayKey === displayKey);
  return picked?.sourceKey === question.correctAnswer;
}

/** Две неверные буквы для отображения (50/50) */
export function pickFiftyFiftyDisplayKeys(
  question: BibleQuestion,
  displayOptions: DisplayOption[]
): AnswerOption[] {
  const wrong = displayOptions.filter(
    (o) => o.sourceKey !== question.correctAnswer
  );
  return shuffle(wrong)
    .slice(0, 2)
    .map((o) => o.displayKey);
}
