"use client";

import { useEffect } from "react";
import { subscribeRoom } from "@/lib/multiplayer/roomService";
import { GameRoomRecord } from "@/lib/multiplayer/types";
import { useGameStore } from "@/store/gameStore";

/** Синхронизация комнаты PocketBase с игровым состоянием */
export default function OnlineRoomSync() {
  const onlineMeta = useGameStore((s) => s.onlineMeta);
  const mode = useGameStore((s) => s.mode);
  const applyOnlineRoom = useGameStore((s) => s.applyOnlineRoom);

  useEffect(() => {
    if (mode !== "online" || !onlineMeta) return;

    const unsubscribe = subscribeRoom(onlineMeta.roomId, (room: GameRoomRecord) => {
      applyOnlineRoom(room);
    });

    return unsubscribe;
  }, [mode, onlineMeta, applyOnlineRoom]);

  return null;
}
