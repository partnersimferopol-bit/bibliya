"use client";

import { useEffect, useState } from "react";
import MainMenu from "@/components/menu/MainMenu";
import SetupScreen from "@/components/menu/SetupScreen";
import PlacementPhase from "@/components/game/PlacementPhase";
import BattlePhase from "@/components/game/BattlePhase";
import GameOver from "@/components/game/GameOver";
import StatsPanel from "@/components/stats/StatsPanel";
import CollectionPanel from "@/components/collection/CollectionPanel";
import { useGameStore } from "@/store/gameStore";

import OnlineLobby from "@/components/multiplayer/OnlineLobby";
import OnlineRoomSync from "@/components/multiplayer/OnlineRoomSync";
import { QuestionMode } from "@/types";

type Screen = "menu" | "setup" | "online" | "stats" | "collection";

function GameHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 text-center py-2 sm:py-3 border-b border-gold-600/20 bg-sea-950/90 backdrop-blur-sm pt-[max(0.5rem,env(safe-area-inset-top))]">
      <span className="text-gold-400 font-display text-sm sm:text-base">{title}</span>
    </header>
  );
}

export default function GameApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [onlineSetup, setOnlineSetup] = useState<{
    questionMode: QuestionMode;
    playerName: string;
  } | null>(null);
  const phase = useGameStore((s) => s.phase);
  const initFromStorage = useGameStore((s) => s.initFromStorage);
  const startGame = useGameStore((s) => s.startGame);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  if (phase === "placement") {
    return (
      <main className="min-h-screen min-h-[100dvh] relative flex flex-col">
        <OnlineRoomSync />
        <GameHeader title="📖 Расстановка флота" />
        <PlacementPhase />
      </main>
    );
  }

  if (phase === "quiz" || phase === "battle") {
    return (
      <main className="min-h-screen min-h-[100dvh] relative flex flex-col">
        <OnlineRoomSync />
        <GameHeader title="📖 Библейская Битва" />
        <BattlePhase />
      </main>
    );
  }

  if (phase === "gameover") {
    return (
      <main className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 pb-safe">
        <GameOver />
      </main>
    );
  }

  return (
    <main className="min-h-screen min-h-[100dvh] relative">
      <div className="p-2 sm:p-4 pb-safe">
        {screen === "menu" && (
          <MainMenu
            onKidsPlay={() => startGame("ai", "kids-quiz", "easy", "Семья")}
            onPlay={() => setScreen("setup")}
            onStats={() => setScreen("stats")}
            onCollection={() => setScreen("collection")}
          />
        )}
        {screen === "setup" && (
          <SetupScreen
            onBack={() => setScreen("menu")}
            onOnline={(questionMode, playerName) => {
              setOnlineSetup({ questionMode, playerName });
              setScreen("online");
            }}
          />
        )}
        {screen === "online" && onlineSetup && (
          <OnlineLobby
            questionMode={onlineSetup.questionMode}
            playerName={onlineSetup.playerName}
            onBack={() => setScreen("setup")}
          />
        )}
        {screen === "stats" && <StatsPanel onBack={() => setScreen("menu")} />}
        {screen === "collection" && <CollectionPanel onBack={() => setScreen("menu")} />}
      </div>
    </main>
  );
}
