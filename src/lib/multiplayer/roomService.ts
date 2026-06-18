import { QuestionMode } from "@/types";
import { getPocketBase } from "@/lib/multiplayer/pbClient";
import { GameRoomRecord } from "@/lib/multiplayer/types";

const COLLECTION = "game_rooms";

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function mapRecord(raw: Record<string, unknown>): GameRoomRecord {
  return {
    id: String(raw.id),
    code: String(raw.code ?? ""),
    status: (raw.status as GameRoomRecord["status"]) ?? "waiting",
    question_mode: (raw.question_mode as QuestionMode) ?? "mixed",
    host_name: String(raw.host_name ?? ""),
    guest_name: String(raw.guest_name ?? ""),
    host_placed: Boolean(raw.host_placed),
    guest_placed: Boolean(raw.guest_placed),
    host_board: (raw.host_board as GameRoomRecord["host_board"]) ?? null,
    guest_board: (raw.guest_board as GameRoomRecord["guest_board"]) ?? null,
    current_player: (raw.current_player as 1 | 2) ?? 1,
    phase: (raw.phase as GameRoomRecord["phase"]) ?? "placement",
    message: String(raw.message ?? ""),
    state_json: String(raw.state_json ?? "{}"),
    updated: String(raw.updated ?? ""),
  };
}

export async function createRoom(
  hostName: string,
  questionMode: QuestionMode
): Promise<GameRoomRecord> {
  const pb = getPocketBase();
  let code = randomCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const record = await pb.collection(COLLECTION).create({
        code,
        status: "waiting",
        question_mode: questionMode,
        host_name: hostName,
        guest_name: "",
        host_placed: false,
        guest_placed: false,
        host_board: null,
        guest_board: null,
        current_player: 1,
        phase: "placement",
        message: "Ожидаем второго игрока…",
        state_json: "{}",
      });
      return mapRecord(record);
    } catch {
      code = randomCode();
    }
  }
  throw new Error("Не удалось создать комнату. Попробуйте ещё раз.");
}

export async function joinRoomByCode(
  code: string,
  guestName: string
): Promise<GameRoomRecord> {
  const pb = getPocketBase();
  const normalized = code.trim().toUpperCase();
  const list = await pb.collection(COLLECTION).getList(1, 1, {
    filter: `code = "${normalized}" && status = "waiting"`,
  });
  if (list.items.length === 0) {
    throw new Error("Комната не найдена или уже занята");
  }
  const room = list.items[0];
  const updated = await pb.collection(COLLECTION).update(room.id, {
    guest_name: guestName,
    status: "placing",
    message: "Оба игрока в комнате — расставьте флот",
  });
  return mapRecord(updated);
}

export async function getRoom(roomId: string): Promise<GameRoomRecord> {
  const pb = getPocketBase();
  const record = await pb.collection(COLLECTION).getOne(roomId);
  return mapRecord(record);
}

export async function updateRoom(
  roomId: string,
  data: Partial<{
    status: string;
    host_placed: boolean;
    guest_placed: boolean;
    host_board: unknown;
    guest_board: unknown;
    current_player: number;
    phase: string;
    message: string;
    state_json: string;
  }>
): Promise<GameRoomRecord> {
  const pb = getPocketBase();
  const record = await pb.collection(COLLECTION).update(roomId, data);
  return mapRecord(record);
}

export function subscribeRoom(
  roomId: string,
  onChange: (room: GameRoomRecord) => void
): () => void {
  const pb = getPocketBase();
  pb.collection(COLLECTION).subscribe(roomId, (e) => {
    if (e.action === "update" || e.action === "create") {
      onChange(mapRecord(e.record));
    }
  });
  return () => {
    pb.collection(COLLECTION).unsubscribe(roomId);
  };
}
