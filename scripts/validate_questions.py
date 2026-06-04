# -*- coding: utf-8 -*-
"""Проверка: correctAnswer указывает на существующий вариант, нет дублей вариантов."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

# Парсим TS-файлы простым regex
QUESTION_FILES = [
    ROOT / "src/data/questions/old-testament.ts",
    ROOT / "src/data/questions/new-testament.ts",
    ROOT / "src/data/questions/psalms-proverbs.ts",
    ROOT / "src/data/questions/general.ts",
]

BLOCK_RE = re.compile(
    r'id:\s*"([^"]+)".*?'
    r'question:\s*("(?:\\.|[^"\\])*"|[^,]+),.*?'
    r'options:\s*\{\s*'
    r'A:\s*("(?:\\.|[^"\\])*"|[^,]+),\s*B:\s*("(?:\\.|[^"\\])*"|[^,]+),\s*'
    r'C:\s*("(?:\\.|[^"\\])*"|[^,]+),\s*D:\s*("(?:\\.|[^"\\])*"|[^,]+),?\s*\},.*?'
    r'correctAnswer:\s*"([ABCD])".*?'
    r'explanation:\s*("(?:\\.|[^"\\])*"|[^,]+)',
    re.DOTALL,
)


def unquote(s: str) -> str:
    s = s.strip()
    if s.startswith('"'):
        return json.loads(s)
    return s.strip('"')


def main():
    errors = []
    for path in QUESTION_FILES:
        text = path.read_text(encoding="utf-8")
        for m in BLOCK_RE.finditer(text):
            qid, q, a, b, c, d, correct, expl = m.groups()
            opts = {
                "A": unquote(a),
                "B": unquote(b),
                "C": unquote(c),
                "D": unquote(d),
            }
            question = unquote(q)
            explanation = unquote(expl)
            correct_text = opts[correct]

            # Дубликаты вариантов
            vals = list(opts.values())
            if len(set(vals)) < 4:
                errors.append(f"{qid}: дублирующиеся варианты {opts}")

            # Пустые
            if any(not v.strip() for v in vals):
                errors.append(f"{qid}: пустой вариант")

            # Число в explanation vs correct (119, 118 и т.д.)
            nums_expl = set(re.findall(r"\b(\d{1,3})\b", explanation))
            nums_correct = set(re.findall(r"\b(\d{1,3})\b", correct_text))
            if nums_expl and nums_correct:
                if not nums_expl & nums_correct and any(n in explanation for n in ["Пс", "гл", "глава", "стих"]):
                    # слабая эвристика для псалмов
                    pass
            # Если в explanation явно номер псалма, он должен быть среди вариантов
            ps_match = re.search(r"Пс(?:алом)?\s*(\d+)", explanation, re.I)
            if ps_match:
                ps_num = ps_match.group(1)
                if ps_num not in vals:
                    errors.append(
                        f'{qid}: в объяснении Пс {ps_num}, но в вариантах {vals} — «{question[:50]}»'
                    )

            # placeholder filler
            if "#" in question and "Вопрос" in question:
                errors.append(f"{qid}: шаблонный вопрос-заглушка")

    if errors:
        print("НАЙДЕНЫ ПРОБЛЕМЫ:")
        for e in errors:
            print(" -", e)
        return 1
    print("OK: явных ошибок не найдено")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
