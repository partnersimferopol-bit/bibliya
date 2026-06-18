export const POCKETBASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL?.trim().replace(/\/$/, "") || "";

export function isOnlineMultiplayerEnabled(): boolean {
  return POCKETBASE_URL.length > 0;
}
