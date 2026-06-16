"use client";

import Link from "next/link";

export default function LegalFooterLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-parchment/50 ${className}`}
      aria-label="Юридические документы"
    >
      <Link href="/privacy/" className="legal-footer-link">
        Политика конфиденциальности
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/terms/" className="legal-footer-link">
        Условия использования
      </Link>
    </nav>
  );
}
