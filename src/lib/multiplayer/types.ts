import { GamePhase, PlayerBoard, QuestionMode } from "@/types";

export type OnlineRole = "host" | "guest";
export type RoomStatus = "waiting" | "placing" | "playing" | "finished";

export interface GameRoomRecord {
  id: string;
  code: string;
  status: RoomStatus;
  question_mode: QuestionMode;
  host_name: string;
  guest_name: string;
  host_placed: boolean;
  guest_placed: boolean;
  host_board: PlayerBoard | null;
  guest_board: PlayerBoard | null;
  current_player: 1 | 2;
  phase: GamePhase;
  message: string;
  state_json: string;
  updated: string;
}

export interface OnlineMeta {
  roomId: string;
  roomCode: string;
  role: OnlineRole;
  mySlot: 1 | 2;
}
