/**
 * Копирует результат next export (папка out/) в корень проекта:
 * index.html, _next/, … — чтобы можно было открыть index.html в браузере.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");

if (!fs.existsSync(outDir)) {
  console.error("Папка out/ не найдена. Сначала выполните: npm run build");
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const name of fs.readdirSync(outDir)) {
  const src = path.join(outDir, name);
  const dest = path.join(root, name);
  if (name === "out") continue;
  if (fs.existsSync(dest)) {
    if (fs.statSync(dest).isDirectory()) {
      fs.rmSync(dest, { recursive: true, force: true });
    } else {
      fs.unlinkSync(dest);
    }
  }
  copyRecursive(src, dest);
}

console.log("Готово: откройте index.html в корне проекта.");
