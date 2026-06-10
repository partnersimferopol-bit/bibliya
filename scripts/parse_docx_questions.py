# -*- coding: utf-8 -*-
"""Парсит вопросы на викторину.docx → TypeScript-модули."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "questions"
NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

LETTER_MAP = {"А": "A", "Б": "B", "В": "C", "Г": "D", "A": "A", "B": "B", "C": "C", "D": "D"}

BOUNDARIES = [
    (0, "old-testament", "easy"),
    (9940, "old-testament", "hard"),
    (20668, "psalms-proverbs", "medium"),
    (35938, "new-testament", "easy"),
    (48094, "new-testament", "hard"),
]


def extract_text(docx_path: Path) -> str:
    with zipfile.ZipFile(docx_path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    return "".join(
        (n.text or "") + (n.tail or "")
        for p in root.iter(NS + "p")
        for n in p.iter(NS + "t")
    )


def find_docx() -> Path:
    for f in ROOT.glob("*.docx"):
        if "tz" not in f.name.lower():
            return f
    raise FileNotFoundError("вопросы на викторину.docx не найден")


def clean(s: str) -> str:
    s = s.replace("\u00a0", " ")
    s = re.sub(r"[·•]\s*", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def get_category(pos: int) -> tuple[str, str]:
    cat, diff = "old-testament", "easy"
    for boundary, c, d in BOUNDARIES:
        if pos >= boundary:
            cat, diff = c, d
    return cat, diff


def find_question_start(text: str, answer_pos: int) -> int:
    """Найти начало вопроса (N. ) перед «Правильный ответ»."""
    before = text[:answer_pos]
    matches = list(re.finditer(r"(?<![:\d])(\d{1,2})\.\s+", before))
    return matches[-1].start() if matches else 0


def parse_chunk(chunk: str, difficulty: str) -> dict | None:
    chunk = chunk.strip()
    if "Правильный" not in chunk or "Обоснование" not in chunk:
        return None

    chunk = re.sub(r"^\d{1,3}\.\s*", "", chunk)

    m_q = re.search(r"^(.+?)(?=[АA]\))", chunk, re.DOTALL)
    if not m_q:
        return None
    question = clean(m_q.group(1))

    options = {}
    opts = re.findall(
        r"[АAБBВCГD]\)\s*(.+?)(?=[АAБBВCГD]\)|Правильный)",
        chunk,
        re.DOTALL,
    )
    for i, k in enumerate("ABCD"):
        if i < len(opts):
            options[k] = clean(opts[i])

    if len(options) < 4:
        return None

    ans_m = re.search(r"Правильный\s+ответ[:\s]*([АAБBВCГD])\)", chunk, re.I)
    if not ans_m:
        return None
    correct = LETTER_MAP.get(ans_m.group(1).upper(), "A")

    expl_m = re.search(r"Обоснование:\s*(.+)", chunk, re.DOTALL)
    explanation = clean(expl_m.group(1)) if expl_m else question

    for k in "ABCD":
        options.setdefault(k, "—")

    return {
        "question": question,
        "options": {k: options[k] for k in "ABCD"},
        "correctAnswer": correct,
        "difficulty": difficulty,
        "explanation": explanation,
    }


def extract_all_questions(text: str) -> list[tuple[int, dict]]:
    """Возвращает (позиция, вопрос)."""
    answer_marks = list(re.finditer(r"Правильный\s+ответ", text, re.I))
    results = []

    for i, m in enumerate(answer_marks):
        q_start = find_question_start(text, m.start())
        if i + 1 < len(answer_marks):
            next_q_start = find_question_start(text, answer_marks[i + 1].start())
            chunk = text[q_start:next_q_start]
        else:
            chunk = text[q_start:]

        cat, diff = get_category(q_start)
        q = parse_chunk(chunk, diff)
        if q and len(q["question"]) > 3:
            q["_cat"] = cat
            results.append((q_start, q))

    return results


def emit_ts(category: str, const_name: str, prefix: str, items: list[dict]) -> None:
    lines = [
        'import type { BibleQuestion } from "@/types";',
        "",
        f"export const {const_name}: BibleQuestion[] = [",
    ]
    for i, q in enumerate(items, 1):
        o = q["options"]
        lines += [
            "  {",
            f'    id: "{prefix}-{i}",',
            f'    category: "{category}",',
            f"    question: {json.dumps(q['question'], ensure_ascii=False)},",
            "    options: {",
            f"      A: {json.dumps(o['A'], ensure_ascii=False)}, B: {json.dumps(o['B'], ensure_ascii=False)},",
            f"      C: {json.dumps(o['C'], ensure_ascii=False)}, D: {json.dumps(o['D'], ensure_ascii=False)},",
            "    },",
            f'    correctAnswer: "{q["correctAnswer"]}",',
            f'    difficulty: "{q["difficulty"]}",',
            f"    explanation: {json.dumps(q['explanation'], ensure_ascii=False)},",
            "  },",
        ]
    lines.append("];")
    lines.append("")
    (OUT / f"{category}.ts").write_text("\n".join(lines), encoding="utf-8")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    docx = find_docx()
    text = extract_text(docx)

    all_q = extract_all_questions(text)
    all_cats: dict[str, list] = {
        "old-testament": [],
        "new-testament": [],
        "psalms-proverbs": [],
        "general": [],
    }

    for _, q in all_q:
        cat = q.pop("_cat")
        all_cats[cat].append(q)

    for cat, items in all_cats.items():
        print(f"{cat}: {len(items)}")

    emit_ts("old-testament", "oldTestamentQuestions", "ot", all_cats["old-testament"])
    emit_ts("new-testament", "newTestamentQuestions", "nt", all_cats["new-testament"])
    emit_ts("psalms-proverbs", "psalmsProverbsQuestions", "pp", all_cats["psalms-proverbs"])
    emit_ts("general", "generalQuestions", "gen", all_cats["general"])

    (OUT / "index.ts").write_text(
        '''import type { BibleQuestion, QuestionCategory } from "@/types";
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
''',
        encoding="utf-8",
    )
    print(f"Всего: {sum(len(v) for v in all_cats.values())}")


if __name__ == "__main__":
    main()
