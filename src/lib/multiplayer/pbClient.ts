import PocketBase from "pocketbase";
import { POCKETBASE_URL } from "@/lib/multiplayer/config";

let client: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (!POCKETBASE_URL) {
    throw new Error("PocketBase URL не настроен");
  }
  if (!client) {
    client = new PocketBase(POCKETBASE_URL);
  }
  return client;
}

export async function checkPocketBaseConnection(): Promise<boolean> {
  if (!POCKETBASE_URL) return false;
  try {
    const pb = getPocketBase();
    await pb.health.check();
    return true;
  } catch {
    return false;
  }
}
