import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { LEGAL_SITE_NAME, termsSections } from "@/content/legal";

export const metadata: Metadata = {
  title: `Условия использования — ${LEGAL_SITE_NAME}`,
  description:
    "Правила использования бесплатной семейной игры «Библейская Битва»: назначение, детский режим, донаты.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Условия использования"
      intro={`Пожалуйста, прочитайте настоящие Условия перед использованием игры «${LEGAL_SITE_NAME}». Они описывают правила бесплатного доступа, детский режим и добровольную поддержку проекта.`}
      sections={termsSections}
      otherPage={{ href: "/privacy/", label: "Политика конфиденциальности" }}
    />
  );
}
