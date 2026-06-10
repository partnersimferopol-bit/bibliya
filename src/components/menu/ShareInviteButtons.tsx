"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import {
  canNativeShare,
  copyGameLink,
  getMaxShareUrl,
  getVkShareUrl,
  nativeShare,
  openShareWindow,
} from "@/lib/share/shareGame";

export default function ShareInviteButtons() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyGameLink();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <p className="text-parchment/70 text-sm text-center mb-1">
        Отправьте ссылку другу — он откроет игру у себя
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openShareWindow(getVkShareUrl())}
        >
          VK
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openShareWindow(getMaxShareUrl())}
        >
          MAX
        </Button>
      </div>
      <Button variant="secondary" size="sm" onClick={handleCopy}>
        {copied ? "✓ Ссылка скопирована" : "📋 Скопировать ссылку"}
      </Button>
      {canNativeShare() && (
        <Button variant="ghost" size="sm" onClick={() => nativeShare()}>
          Поделиться…
        </Button>
      )}
    </div>
  );
}
