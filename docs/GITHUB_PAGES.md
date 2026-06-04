# Публикация на GitHub Pages

Сайт: [https://partnersimferopol-bit.github.io/bibliya/](https://partnersimferopol-bit.github.io/bibliya/)

## Почему была «белая страница»

1. **Папка `_next` не отдавалась** — GitHub Pages по умолчанию использует Jekyll и **игнорирует** каталоги с `_`. Нужен файл `.nojekyll` в корне сайта (лежит в `public/.nojekyll`).
2. **Загружали только `index.html`** — без `_next/static/...` не подключаются CSS и JavaScript.
3. **Меню с `opacity: 0`** до загрузки JS — без скриптов экран оставался пустым (исправлено в коде).

## Автоматический деплой

1. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Запушьте в `main` — workflow `.github/workflows/deploy-pages.yml` соберёт проект и выложит папку `out/`.

## Ручная сборка

```bash
# Windows PowerShell
$env:BUILD_TARGET="github-pages"
npm run build:pages
```

Залейте **всё содержимое** папки `out/` в ветку `gh-pages` или в корень публикации Pages (включая `_next` и `.nojekyll`).

## Локальный index.html

Обычная сборка без GitHub Pages:

```bash
npm run build
```

Откроется `index.html` с относительными путями `./_next/...`.
