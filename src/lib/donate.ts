/** Страница добровольного пожертвования (ЮMoney) */
const DEFAULT_DONATE_URL =
  "https://yoomoney.ru/quickpay/fundraise/button?billNumber=1IF95MPIKG6.260617";

/** Ссылка на донаты; можно переопределить через NEXT_PUBLIC_DONATE_URL */
export const DONATE_URL =
  process.env.NEXT_PUBLIC_DONATE_URL?.trim() || DEFAULT_DONATE_URL;
export const DONATE_LABEL =
  process.env.NEXT_PUBLIC_DONATE_LABEL?.trim() || "Добровольное пожертвование";

/** Текст назначения для страницы приёма переводов (ЮMoney и др.) */
export const DONATE_PURPOSE =
  process.env.NEXT_PUBLIC_DONATE_PURPOSE?.trim() ||
  "Добровольное пожертвование на развитие проекта «Библейская Битва»";

import { isVkEnvironment } from "@/lib/vk/vkBridge";

export function isDonateEnabled(): boolean {
  if (typeof window !== "undefined" && isVkEnvironment()) return false;
  return DONATE_URL.length > 0;
}

export function openDonatePage(): void {
  if (!isDonateEnabled()) return;
  window.open(DONATE_URL, "_blank", "noopener,noreferrer");
}
