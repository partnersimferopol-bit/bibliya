import Link from "next/link";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_GITHUB_ISSUES,
  LEGAL_LAST_UPDATED,
  LegalSection,
} from "@/content/legal";

interface LegalDocumentProps {
  title: string;
  intro: string;
  sections: LegalSection[];
  otherPage: { href: string; label: string };
}

function ContactBlock() {
  return (
    <section className="legal-section">
      <h2 className="legal-section-title">Контакты</h2>
      <p>
        По вопросам, связанным с Игрой, Политикой конфиденциальности и Условиями
        использования, вы можете обратиться к оператору:
      </p>
      <ul className="legal-list">
        {LEGAL_CONTACT_EMAIL ? (
          <li>
            E-mail:{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="legal-link">
              {LEGAL_CONTACT_EMAIL}
            </a>
          </li>
        ) : null}
        <li>
          GitHub:{" "}
          <a
            href={LEGAL_GITHUB_ISSUES}
            className="legal-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            оставить обращение
          </a>
        </li>
      </ul>
    </section>
  );
}

export default function LegalDocument({
  title,
  intro,
  sections,
  otherPage,
}: LegalDocumentProps) {
  return (
    <main className="min-h-screen min-h-[100dvh] p-4 sm:p-6 pb-safe">
      <article className="legal-page max-w-2xl mx-auto scroll-border rounded-xl p-5 sm:p-8">
        <p className="text-gold-500/80 text-xs sm:text-sm mb-4">
          Обновлено: {LEGAL_LAST_UPDATED}
        </p>
        <h1 className="text-2xl sm:text-3xl text-gold-400 font-display mb-4">
          {title}
        </h1>
        <p className="text-parchment/85 mb-8 leading-relaxed">{intro}</p>

        {sections.map((section) => (
          <section key={section.title} className="legal-section">
            <h2 className="legal-section-title">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}

        <ContactBlock />

        <footer className="legal-footer">
          <Link href="/" className="legal-link">
            ← Вернуться в игру
          </Link>
          <span className="text-parchment/40">·</span>
          <Link href={otherPage.href} className="legal-link">
            {otherPage.label}
          </Link>
        </footer>
      </article>
    </main>
  );
}
