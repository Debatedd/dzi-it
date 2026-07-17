import Link from "next/link";

export const metadata = {
  title: "Политика за поверителност — ДЗИ по ИТ",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16" style={{ color: "var(--text)" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
          &larr; Начало
        </Link>

        <h1 className="font-extrabold text-3xl mt-6 mb-2">Политика за поверителност</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Последна актуализация: юни 2026 г.
        </p>

        <div className="glass rounded-2xl p-7 space-y-6 text-sm leading-relaxed" style={{ border: "1px solid var(--border)" }}>
          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "var(--accent)" }}>Накратко</h2>
            <p style={{ color: "var(--muted)" }}>
              Това е безплатна, неофициална платформа за подготовка за ДЗИ по ИТ. Събираме
              минимума данни, нужни за да можеш да имаш акаунт и да пазиш напредъка си.
              Не продаваме и не споделяме данните ти с трети страни.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "var(--accent)" }}>Какви данни събираме</h2>
            <ul className="list-disc list-inside space-y-1" style={{ color: "var(--muted)" }}>
              <li><b style={{ color: "var(--text)" }}>Имейл</b> — за вход в акаунта и възстановяване на достъп.</li>
              <li><b style={{ color: "var(--text)" }}>Потребителско име</b> — показва се в платформата.</li>
              <li><b style={{ color: "var(--text)" }}>Парола</b> — съхранява се криптирана (хеширана); никой, включително ние, не я вижда.</li>
              <li><b style={{ color: "var(--text)" }}>Напредък</b> — решени въпроси, точки и серии, за да ги виждаш на всяко устройство.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "var(--accent)" }}>Защо ги събираме</h2>
            <p style={{ color: "var(--muted)" }}>
              Единствено за да работи акаунтът ти и да пазим напредъка ти. Не използваме данните
              за реклама, не ги анализираме за други цели и не ги предоставяме на никого.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "var(--accent)" }}>Къде се съхраняват</h2>
            <p style={{ color: "var(--muted)" }}>
              Данните се пазят сигурно при <b style={{ color: "var(--text)" }}>Supabase</b> на сървъри
              в Европейския съюз (Ирландия), в съответствие с GDPR.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "var(--accent)" }}>Твоите права</h2>
            <p style={{ color: "var(--muted)" }}>
              По всяко време можеш да поискаш достъп до данните си, корекция или пълно изтриване на
              акаунта и всичко свързано с него. Просто ни пиши и ще го направим.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "var(--accent)" }}>Контакт</h2>
            <p style={{ color: "var(--muted)" }}>
              За въпроси относно данните си пиши на{" "}
              <a href="mailto:viktorskipetrov@proton.me" style={{ color: "var(--accent)" }}>
                viktorskipetrov@proton.me
              </a>
              .
            </p>
          </section>

          <p className="text-xs pt-2" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
            Платформата е неофициална и не е свързана с МОН. Въпросите в платформата са авторски,
            съставени по учебно-изпитната програма за ДЗИ по информационни технологии. Малка част от
            задачите възпроизвеждат въпроси от официални зрелостни изпити, публикувани публично от МОН,
            и са обозначени като такива в данните на платформата.
          </p>
        </div>
      </div>
    </main>
  );
}
