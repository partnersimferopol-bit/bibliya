"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { checkPocketBaseConnection } from "@/lib/multiplayer/pbClient";
import { isOnlineMultiplayerEnabled, POCKETBASE_URL } from "@/lib/multiplayer/config";
import { createRoom, joinRoomByCode } from "@/lib/multiplayer/roomService";
import { QuestionMode } from "@/types";
import { useGameStore } from "@/store/gameStore";

interface OnlineLobbyProps {
  questionMode: QuestionMode;
  playerName: string;
  onBack: () => void;
}

export default function OnlineLobby({ questionMode, playerName, onBack }: OnlineLobbyProps) {
  const startOnlineGame = useGameStore((s) => s.startOnlineGame);
  const [joinCode, setJoinCode] = useState("");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOnlineMultiplayerEnabled()) {
      setServerOk(false);
      return;
    }
    checkPocketBaseConnection().then(setServerOk);
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setStatus("");
    try {
      const room = await createRoom(playerName, questionMode);
      setRoomCode(room.code);
      setStatus("Отправьте код другу. Ждём подключения…");
      startOnlineGame(
        { roomId: room.id, roomCode: room.code, role: "host", mySlot: 1 },
        questionMode,
        playerName
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Ошибка создания комнаты");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (joinCode.trim().length < 4) {
      setStatus("Введите код комнаты");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const room = await joinRoomByCode(joinCode, playerName);
      setRoomCode(room.code);
      setStatus("Подключено! Расставьте флот.");
      startOnlineGame(
        { roomId: room.id, roomCode: room.code, role: "guest", mySlot: 2 },
        questionMode,
        playerName
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Не удалось войти в комнату");
    } finally {
      setLoading(false);
    }
  };

  if (!isOnlineMultiplayerEnabled()) {
    return (
      <div className="max-w-lg mx-auto p-6 scroll-border rounded-xl">
        <h2 className="text-xl text-gold-400 font-display mb-4 text-center">
          Онлайн-игра
        </h2>
        <p className="text-parchment/80 text-sm mb-4">
          Сервер ещё не настроен. После аренды VPS на Timeweb укажите адрес PocketBase в
          переменной <code className="text-gold-400">NEXT_PUBLIC_POCKETBASE_URL</code>.
        </p>
        <Button variant="ghost" onClick={onBack}>
          ← Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 scroll-border rounded-xl w-full">
      <h2 className="text-2xl text-gold-400 font-display mb-2 text-center">
        🌐 Игра с другом онлайн
      </h2>
      <p className="text-parchment/60 text-sm text-center mb-4">
        Игрок 1 создаёт комнату, игрок 2 вводит код
      </p>

      {serverOk === false && (
        <p className="text-red-400/90 text-sm text-center mb-4">
          Сервер недоступен: {POCKETBASE_URL}
        </p>
      )}
      {serverOk === true && (
        <p className="text-green-400/80 text-sm text-center mb-4">Сервер подключён ✓</p>
      )}

      {roomCode && (
        <div className="mb-6 p-4 rounded-lg bg-sea-900/60 border border-gold-600/30 text-center">
          <p className="text-parchment/70 text-sm mb-1">Код комнаты</p>
          <p className="text-3xl font-display text-gold-400 tracking-widest">{roomCode}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-6">
        <Button size="lg" disabled={loading || serverOk === false} onClick={handleCreate}>
          Создать комнату
        </Button>

        <div className="border-t border-gold-600/20 pt-4">
          <label className="block mb-2">
            <span className="text-parchment/80 text-sm">Код от друга</span>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="AB12CD"
              className="mt-1 w-full px-3 py-2 rounded bg-sea-900 border border-gold-600/40 text-parchment text-center text-lg tracking-widest uppercase"
            />
          </label>
          <Button
            variant="secondary"
            className="w-full"
            disabled={loading || serverOk === false}
            onClick={handleJoin}
          >
            Войти в комнату
          </Button>
        </div>
      </div>

      {status && <p className="text-center text-parchment/80 text-sm mb-4">{status}</p>}

      <Button variant="ghost" onClick={onBack}>
        ← Назад
      </Button>
    </div>
  );
}
