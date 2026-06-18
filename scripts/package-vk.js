/**
 * Сборка ZIP-архива для загрузки в VK Игры / мини-приложение.
 * Содержимое out/ — index.html в корне архива.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");
const distDir = path.join(root, "dist");
const zipPath = path.join(distDir, "bibliya-vk.zip");

if (!fs.existsSync(outDir)) {
  console.error("Папка out/ не найдена. Сначала выполните: npm run build:vk");
  process.exit(1);
}

if (!fs.existsSync(path.join(outDir, "index.html"))) {
  console.error("В out/ нет index.html. Проверьте сборку.");
  process.exit(1);
}

fs.mkdirSync(distDir, { recursive: true });
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

if (process.platform === "win32") {
  execSync(
    `Compress-Archive -Path "${outDir}\\*" -DestinationPath "${zipPath}" -Force`,
    { stdio: "inherit", shell: "powershell.exe" }
  );
} else {
  execSync(`cd "${outDir}" && zip -r "${zipPath}" .`, { stdio: "inherit", shell: true });
}

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log("");
console.log("✅ Архив для VK готов:");
console.log(`   ${zipPath}`);
console.log(`   Размер: ~${sizeMb} МБ`);
console.log("");
console.log("Дальше в кабинете VK (dev.vk.com):");
console.log("1. Создайте мини-приложение или игру → тип HTML5");
console.log("2. Загрузите bibliya-vk.zip или укажите хостинг с index.html");
console.log("3. Включите приложение и отправьте на модерацию");
