"use client";

import Button from "@/components/ui/Button";
import { DONATE_LABEL, isDonateEnabled, openDonatePage } from "@/lib/donate";

interface DonateLinkProps {
  variant?: "button" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

export default function DonateLink({
  variant = "button",
  size = "sm",
  className = "",
  message,
}: DonateLinkProps) {
  if (!isDonateEnabled()) return null;

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={openDonatePage}
        className={`text-gold-400/80 hover:text-gold-300 text-sm underline-offset-2 hover:underline transition-colors ${className}`}
      >
        💛 {DONATE_LABEL}
      </button>
    );
  }

  return (
    <div className={className}>
      {message && (
        <p className="text-parchment/60 text-xs sm:text-sm mb-2 text-center leading-relaxed">
          {message}
        </p>
      )}
      <Button variant="ghost" size={size} onClick={openDonatePage}>
        💛 {DONATE_LABEL}
      </Button>
    </div>
  );
}
