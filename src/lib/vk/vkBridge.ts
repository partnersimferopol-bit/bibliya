import bridge from "@vkontakte/vk-bridge";
import { getGameUrl, getShareText } from "@/lib/share/shareGame";

let initialized = false;

export function isVkBuild(): boolean {
  return process.env.NEXT_PUBLIC_BUILD_TARGET === "vk";
}

/** Запущено внутри ВКонтакте (iframe / WebView) */
export function isVkEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const q = window.location.search;
  return /[?&]vk_/.test(q) || isVkBuild();
}

export async function initVkBridge(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await bridge.send("VKWebAppInit");
  } catch {
    /* вне ВК — тихо игнорируем */
  }
}

export function getVkAppShareLink(): string {
  if (typeof window === "undefined") return getGameUrl();
  const appId = new URLSearchParams(window.location.search).get("vk_app_id");
  if (appId) return `https://vk.com/app${appId}`;
  return getGameUrl();
}

export async function shareViaVkBridge(): Promise<boolean> {
  try {
    await bridge.send("VKWebAppShare", {
      link: getVkAppShareLink(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function inviteFriendsVk(): Promise<boolean> {
  try {
    await bridge.send("VKWebAppShowInviteBox", {});
    return true;
  } catch {
    return false;
  }
}

export { bridge };
