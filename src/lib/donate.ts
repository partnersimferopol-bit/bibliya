/** Ссылка на донаты (Boosty, ЮMoney, Patreon и т.д.) */
export const DONATE_URL =
  process.env.NEXT_PUBLIC_DONATE_URL?.trim() || "";

export const DONATE_LABEL =
  process.env.NEXT_PUBLIC_DONATE_LABEL?.trim() || "Добровольное пожертвование";

/** Текст назначения для страницы приёма переводов (ЮMoney и др.) */
export const DONATE_PURPOSE =
  process.env.NEXT_PUBLIC_DONATE_PURPOSE?.trim() ||
  "Добровольное пожертвование на развитие проекта «Библейская Битва»";

export function isDonateEnabled(): boolean {
  return DONATE_URL.length > 0;
}

export function openDonatePage(): void {
  if (!isDonateEnabled()) return;
  window.open(DONATE_URL, "_blank", "noopener,noreferrer");
}
