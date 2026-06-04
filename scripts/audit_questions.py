# -*- coding: utf-8 -*-
"""Полный аудит: correctAnswer, дубли, числа из explanation должны быть в вариантах."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = list((ROOT / "src/data/questions").glob("*.ts"))
FILES = [f for f in FILES if f.name != "index.ts"]

BLOCK = re.compile(
    r'id:\s*"([^"]+)".*?question:\s*("(?:\\.|[^"\\])*").*?'
    r'options:\s*\{\s*'
    r'A:\s*("(?:\\.|[^"\\])*"),\s*B:\s*("(?:\\.|[^"\\])*"),\s*'
    r'C:\s*("(?:\\.|[^"\\])*"),\s*D:\s*("(?:\\.|[^"\\])*"),?\s*\},.*?'
    r'correctAnswer:\s*"([ABCD])".*?'
    r'explanation:\s*("(?:\\.|[^"\\])*")',
    re.DOTALL,
)


def unq(s):
    return json.loads(s.strip())


def main():
    issues = []
    for path in FILES:
        text = path.read_text(encoding="utf-8")
        for m in BLOCK.finditer(text):
            qid, q, a, b, c, d, correct, expl = m.groups()
            question = unq(q)
            opts = {"A": unq(a), "B": unq(b), "C": unq(c), "D": unq(d)}
            explanation = unq(expl)
            ct = opts[correct]
            vals = list(opts.values())

            if len(set(vals)) < 4:
                issues.append((qid, "дубликаты вариантов", opts))

            # Числа в explanation «Пс N» / «Псалом N»
            for ps in re.finditer(r"(?:Псалом|Пс\.?)\s*(\d+)", explanation, re.I):
                num = ps.group(1)
                if num not in vals and not any(num in v for v in vals):
                    issues.append((qid, f"в объяснении Пс {num}, нет в вариантах", question, vals))

            # Вопрос про номер псалма — правильный ответ должен быть числом из explanation
            if re.search(r"псалом|псалме|пс\.?\s*\d", question, re.I) and re.search(r"\d+", ct):
                nums_e = re.findall(r"\b(\d+)\b", explanation)
                nums_c = re.findall(r"\b(\d+)\b", ct)
                if nums_e and nums_c and not set(nums_e) & set(nums_c):
                    issues.append((qid, "число в ответе не совпадает с объяснением", ct, explanation))

    if issues:
        print(f"Проблем: {len(issues)}")
        for row in issues:
            print(" | ".join(str(x) for x in row))
        return 1
    print("Аудит пройден:", sum(1 for _ in FILES), "файлов")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
