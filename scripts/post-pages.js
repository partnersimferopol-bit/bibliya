/** После сборки для GitHub Pages: .nojekyll в out/ */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "out");
const src = path.join(__dirname, "..", "public", ".nojekyll");
const dest = path.join(out, ".nojekyll");

if (!fs.existsSync(out)) {
  console.error("Нет папки out/. Запустите: BUILD_TARGET=github-pages npm run build:pages");
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log("Добавлен out/.nojekyll для GitHub Pages");
