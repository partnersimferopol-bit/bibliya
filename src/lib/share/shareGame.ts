export const GAME_TITLE = "Библейская Битва";

const FALLBACK_URL = "https://partnersimferopol-bit.github.io/bibliya/";

export function getGameUrl(): string {
  if (typeof window === "undefined") return FALLBACK_URL;
  return window.location.href.split("?")[0].split("#")[0];
}

export function getShareText(): string {
  return `📖 Играй со мной в «${GAME_TITLE}»! Семейная библейская викторина с соревнованием — есть детский режим с картинками.`;
}

export function getFullShareMessage(): string {
  return `${getShareText()}\n${getGameUrl()}`;
}

export function getVkShareUrl(url = getGameUrl(), text = getShareText()): string {
  const params = new URLSearchParams({ url, title: GAME_TITLE, comment: text });
  return `https://vk.com/share.php?${params.toString()}`;
}

/** Официальный диплинк MAX: открывает экран «Отправить в MAX» */
export function getMaxShareUrl(text = getShareText(), url = getGameUrl()): string {
  return `https://max.ru/:share?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

export function openShareWindow(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
}

export async function copyGameLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(getFullShareMessage());
    return true;
  } catch {
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({
      title: GAME_TITLE,
      text: getShareText(),
      url: getGameUrl(),
    });
    return true;
  } catch {
    return false;
  }
}
