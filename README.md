# Морской бой: Библейская Битва

Веб-игра «Морской бой» на поле **8×8** (6 кораблей) с библейской викториной перед каждым выстрелом. Адаптирована под мобильные телефоны.

## Стек

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion

## Запуск

### Онлайн (GitHub Pages)

[https://partnersimferopol-bit.github.io/bibliya/](https://partnersimferopol-bit.github.io/bibliya/)

См. [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md) — настройка деплоя и типичные ошибки.

### Вариант 1: открыть в браузере без сервера

```bash
npm install
npm run build
```

Дважды щёлкните **`index.html`** в корне проекта (или перетащите файл в окно Chrome / Edge / Firefox).

### Вариант 2: режим разработки

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Возможности

- Флот: 1×5, 2×4, 3×3, 4×2, 5×1 клеток
- **200 вопросов** в 4 категориях (по 50)
- Режимы: против ИИ (3 уровня), два игрока (hotseat)
- Подсказки: 50/50, «Помощь из Писания»
- Локальная статистика, таблица лидеров, коллекция кораблей и тем

## Структура

```
src/
  data/questions/     # 4 категории + index.ts
  data/questions.ts   # реэкспорт
  lib/game/           # поле, ИИ
  lib/quiz/           # викторина
  lib/storage/        # localStorage
  store/              # Zustand
  components/         # UI
```

## Пересборка вопросов

```bash
python scripts/build_questions.py
```
