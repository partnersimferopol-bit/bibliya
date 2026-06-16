# -*- coding: utf-8 -*-
"""Парсит вопросы для детской викторины.docx → TS + копирует картинки в public."""
import json
import re
import shutil
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_TS = ROOT / "src" / "data" / "questions" / "kids-quiz.ts"
OUT_IMG = ROOT / "public" / "kids-quiz"
NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
LETTER_MAP = {1: "A", 2: "B", 3: "C", 4: "D"}


def find_docx() -> Path:
    for f in ROOT.glob("*.docx"):
        name_lower = f.name.lower()
        # Файлы блокировки Word начинаются с "~$" и часто не являются валидным docx-архивом.
        if name_lower.startswith("~$"):
            continue
        if "дет" in name_lower:
            # На всякий случай проверим, что файл реально является zip-архивом.
            try:
                with zipfile.ZipFile(f) as z:
                    # Достаточно открыть архив; дальше распарсим document.xml
                    z.namelist()
                return f
            except zipfile.BadZipFile:
                continue
    raise FileNotFoundError("вопросы для детской викторины.docx не найден")


def find_images_dir() -> Path:
    for d in ROOT.iterdir():
        if d.is_dir() and "карт" in d.name.lower() and "дет" in d.name.lower():
            return d
    raise FileNotFoundError("папка «картинки детская викторина» не найдена")


def extract_text(docx_path: Path) -> str:
    with zipfile.ZipFile(docx_path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    return "".join(
        (n.text or "") + (n.tail or "")
        for p in root.iter(NS + "p")
        for n in p.iter(NS + "t")
    )


def clean(s: str) -> str:
    s = s.replace("\u00a0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def strip_option_note(text: str) -> str:
    text = re.sub(r"\s*\((?:верно|неверно)[^)]*\)\.?\s*", "", text, flags=re.I)
    return clean(text)


def difficulty_for(num: int) -> str:
    if num <= 17:
        return "easy"
    if num <= 34:
        return "medium"
    return "hard"


def normalize_text(text: str) -> str:
    text = re.sub(r"Вопрос(\d+)", r"Вопрос \1", text)
    text = re.sub(
        r"(?<![\d])(\d{1,2})\.\s+(Основная картин[аК]:)",
        r"Вопрос \1. \2",
        text,
        flags=re.IGNORECASE,
    )
    return text


def parse_numbered_options(opts_raw: str, num: int) -> tuple[list[dict], int]:
    parsed_opts = []
    correct_num = None
    for onum, otext in re.findall(r"(\d+)\.\s*(.+?)(?=\d+\.|$)", opts_raw, re.DOTALL):
        opt_num = int(onum)
        if opt_num > 4:
            break
        raw = clean(otext)
        is_correct = bool(re.search(r"\(\s*верно", raw, re.I))
        parsed_opts.append(
            {
                "num": opt_num,
                "text": strip_option_note(raw),
                "correct": is_correct,
            }
        )
        if is_correct:
            correct_num = opt_num
        if len(parsed_opts) == 4:
            break

    if correct_num is None and num in {42, 49, 50}:
        correct_num = 4
        parsed_opts[3]["correct"] = True

    if correct_num is None or len(parsed_opts) != 4:
        raise ValueError(f"Вопрос {num}: некорректные варианты ({len(parsed_opts)})")

    return parsed_opts, correct_num


def parse_old_format(part: str, num: int) -> dict:
    m = re.match(
        r"Вопрос\s+(\d+)\s*[\.:]?\s*(.+?)(?=·\s*Основная картинка:)",
        part,
        re.DOTALL,
    )
    if not m:
        raise ValueError(f"Не удалось разобрать заголовок вопроса {num}")

    title = clean(m.group(2).replace("·", ""))
    m_scenario = re.search(
        r"Основная картинка:\s*(.+?)(?=·\s*Вопрос на картинке:)",
        part,
        re.DOTALL,
    )
    m_question = re.search(r"Вопрос на картинке:\s*[«\"](.+?)[»\"]", part)
    m_opts = re.search(
        r"Картинки-ответы:\s*(.+?)(?=---|Вопрос\s*\d+|$)",
        part,
        re.DOTALL,
    )
    if not m_question or not m_opts:
        raise ValueError(f"Не удалось разобрать вопрос {num}")

    scenario = clean(m_scenario.group(1)) if m_scenario else ""
    question = clean(m_question.group(1))
    parsed_opts, correct_num = parse_numbered_options(m_opts.group(1), num)

    return {
        "num": num,
        "title": title,
        "scenario": scenario,
        "question": question,
        "options": parsed_opts,
        "correct_num": correct_num,
        "difficulty": difficulty_for(num),
    }


def parse_new_format(part: str, num: int) -> dict:
    body = re.sub(rf"^Вопрос\s*{num}\.\s*", "", part, count=1).strip()
    body = re.sub(r"^Основная картин[аК]:\s*", "", body, flags=re.IGNORECASE)

    scenario = ""
    options_part = ""

    if "Вопрос на картинке:" in body:
        scenario_part, rest = body.split("Вопрос на картинке:", 1)
        scenario = clean(scenario_part.rstrip("."))
        m_q = re.search(r'^[«"]?\s*(.+?)\s*[»"]?\s*(?=\d+\.)', rest, re.DOTALL)
        if not m_q:
            m_q = re.search(r"^(.+?\?)\s*(?=\d+\.)", rest, re.DOTALL)
        if not m_q:
            raise ValueError(f"Не удалось разобрать вопрос {num}")
        question = clean(m_q.group(1))
        options_part = rest[m_q.end() :]
    else:
        m_block = re.search(r"^(.+?\?)\s*(?=\d+\.)", body, re.DOTALL)
        if not m_block:
            raise ValueError(f"Не удалось разобрать вопрос {num}")
        full = clean(m_block.group(1))
        if "." in full:
            scenario, question = [clean(x) for x in full.rsplit(".", 1)]
        else:
            scenario = ""
            question = full
        options_part = body[m_block.end() :]

    title = scenario.split(".")[0][:80] if scenario else f"Вопрос {num}"
    parsed_opts, correct_num = parse_numbered_options(options_part, num)

    return {
        "num": num,
        "title": title,
        "scenario": scenario,
        "question": question,
        "options": parsed_opts,
        "correct_num": correct_num,
        "difficulty": difficulty_for(num),
    }


def parse_questions(text: str) -> list[dict]:
    text = normalize_text(text)
    text = re.sub(
        r"---\s*Этот формат.+?(?=Вопрос\s*\d+)",
        "",
        text,
        flags=re.DOTALL,
    )
    text = re.sub(
        r"---\s*Часть\s+\d+\..+?(?=Вопрос\s*\d+)",
        "",
        text,
        flags=re.DOTALL,
    )
    text = re.sub(
        r"---\s*Дополнительный блок:.+?(?=Вопрос\s*\d+)",
        "",
        text,
        flags=re.DOTALL,
    )
    text = re.sub(r"---\s*Этот формат.+$", "", text, flags=re.DOTALL)

    parts = re.split(r"(?=Вопрос\s*\d+)", text)
    questions = []

    for part in parts:
        m_num = re.match(r"Вопрос\s*(\d+)", part)
        if not m_num:
            continue
        num = int(m_num.group(1))

        if "Картинки-ответы" in part or "· Основная картинка" in part:
            questions.append(parse_old_format(part, num))
        elif re.search(r"Основная картин", part, re.IGNORECASE):
            questions.append(parse_new_format(part, num))

    questions.sort(key=lambda q: q["num"])
    return questions


def find_image(images_dir: Path, num: int, opt: int | None = None) -> str | None:
    if opt is None:
        pattern = re.compile(rf"^{num}(\s*\(\d+\))?$", re.IGNORECASE)
    else:
        pattern = re.compile(rf"^{num}-{opt}(\s*\(\d+\))?$", re.IGNORECASE)

    for path in sorted(images_dir.iterdir()):
        if path.suffix.lower() not in {".jpeg", ".jpg", ".png", ".webp"}:
            continue
        if pattern.match(path.stem):
            return path.name
    return None


def copy_images(questions: list[dict], images_dir: Path) -> None:
    if OUT_IMG.exists():
        shutil.rmtree(OUT_IMG)
    OUT_IMG.mkdir(parents=True)

    for q in questions:
        num = q["num"]
        main = find_image(images_dir, num)
        if not main:
            raise FileNotFoundError(f"Нет картинки для вопроса {num}")
        shutil.copy2(images_dir / main, OUT_IMG / f"{num}.webp" if main.endswith(".webp") else OUT_IMG / main)
        q["image"] = (OUT_IMG / main).name

        for opt in q["options"]:
            onum = opt["num"]
            img = find_image(images_dir, num, onum)
            if not img:
                raise FileNotFoundError(f"Нет картинки {num}-{onum}")
            dest_name = f"{num}-{onum}{Path(img).suffix.lower()}"
            shutil.copy2(images_dir / img, OUT_IMG / dest_name)
            opt["image"] = dest_name


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def emit_ts(questions: list[dict]) -> str:
    lines = [
        'import type { BibleQuestion } from "@/types";',
        "",
        "export const kidsQuizQuestions: BibleQuestion[] = [",
    ]

    for q in questions:
        correct_letter = LETTER_MAP[q["correct_num"]]
        opts = {LETTER_MAP[o["num"]]: o["text"] for o in q["options"]}
        opt_images = {LETTER_MAP[o["num"]]: f"/kids-quiz/{o['image']}" for o in q["options"]}

        lines.append("  {")
        lines.append(f'    id: "kids-{q["num"]}",')
        lines.append('    category: "kids-quiz",')
        lines.append(f'    question: "{ts_escape(q["question"])}",')
        lines.append(f'    title: "{ts_escape(q["title"])}",')
        if q["scenario"]:
            lines.append(f'    scenario: "{ts_escape(q["scenario"])}",')
        lines.append(f'    image: "/kids-quiz/{q["image"]}",')
        lines.append("    options: {")
        for key in ("A", "B", "C", "D"):
            lines.append(f'      {key}: "{ts_escape(opts[key])}",')
        lines.append("    },")
        lines.append("    optionImages: {")
        for key in ("A", "B", "C", "D"):
            lines.append(f'      {key}: "{opt_images[key]}",')
        lines.append("    },")
        lines.append(f'    correctAnswer: "{correct_letter}",')
        lines.append(f'    difficulty: "{q["difficulty"]}",')
        lines.append(f'    explanation: "{ts_escape(q["options"][q["correct_num"] - 1]["text"])}",')
        lines.append("  },")

    lines.append("];")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    docx = find_docx()
    images_dir = find_images_dir()
    text = extract_text(docx)
    questions = parse_questions(text)
    copy_images(questions, images_dir)

    OUT_TS.write_text(emit_ts(questions), encoding="utf-8")
    print(f"Вопросов: {len(questions)}")
    print(f"Картинки: {OUT_IMG}")
    print(f"Данные: {OUT_TS}")


if __name__ == "__main__":
    main()
