import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { LEGAL_SITE_NAME, privacySections } from "@/content/legal";

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${LEGAL_SITE_NAME}`,
  description:
    "Как «Библейская Битва» использует данные: локальное хранение в браузере, детский режим, внешние ссылки.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Политика конфиденциальности"
      intro={`Настоящий документ объясняет, какие сведения могут сохраняться при использовании игры «${LEGAL_SITE_NAME}», где они хранятся и как вы можете ими распорядиться.`}
      sections={privacySections}
      otherPage={{ href: "/terms/", label: "Условия использования" }}
    />
  );
}
