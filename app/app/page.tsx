import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";
import ScrollReveal from "@/components/ScrollReveal";
import GameStats from "@/components/GameStats";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

const TOPIC_META: Record<string, { color: string; label: string }> = {
  "обработка-анализ": { color: "var(--paper)", label: "Обработка и Анализ на Данни" },
  "мултимедия":       { color: "var(--paper)", label: "Мултимедия" },
  "уеб-дизайн":       { color: "var(--red)",   label: "Уеб Дизайн" },
  "решаване-икт":     { color: "var(--accent-2-text)", label: "Решаване на проблеми с ИКТ" },
};

export default async function HomePage() {
  const topicMap = new Map<string, number>();
  for (const q of questions) topicMap.set(q.topic, (topicMap.get(q.topic) ?? 0) + 1);
  const topics         = Array.from(topicMap.entries());
  const totalQuestions = questions.length + openQuestions.length;
  const totalTopics    = topics.length;

  let user = null;
  let displayName: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        displayName = profile?.username ?? user.email ?? null;
      }
    } catch { user = null; }
  }

  const navLink = { color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase" as const };

  return (
    <>
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}
      >
        {/* hamburger on mobile */}
        <details className="sm:hidden relative">
          <summary className="nav-burger flex items-center justify-center cursor-pointer"
            style={{ width: 38, height: 38, border: "1px solid var(--border)", color: "var(--paper)", borderRadius: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </summary>
          <div className="absolute top-full left-0 mt-2 flex flex-col w-56"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4 }}>
            {[["/rewards", "Награди"], ["/feedback", "Обратна връзка"], ["/contact", "Контакт"], ["/quiz", "Quiz стая"]].map(([href, label]) => (
              <Link key={href} href={href} className="px-4 py-3" style={{ ...navLink, borderBottom: "1px solid var(--border)" }}>{label}</Link>
            ))}
          </div>
        </details>

        <div className="hidden sm:flex items-center gap-7">
          <Link href="/rewards" style={navLink}>Награди</Link>
          <Link href="/feedback" style={navLink}>Обратна връзка</Link>
          <Link href="/contact" style={navLink}>Контакт</Link>
        </div>

        {/* account */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 sm:ml-2" style={{ borderLeft: "1px solid var(--border)" }}>
            <Link href="/profile" className="flex items-center gap-2.5" style={{ textDecoration: "none" }} title="Моят профил">
              <span className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 32, height: 32, border: "1.5px solid var(--red)", color: "var(--paper)", fontFamily: MONO, fontSize: "0.78rem", fontWeight: 600 }}>
                {(displayName ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline" style={{ color: "var(--paper)", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.08em" }}>{displayName}</span>
            </Link>
            <form action={logout}>
              <button type="submit" style={{ ...navLink, background: "transparent", border: "1px solid var(--border)", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}>
                Изход
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="sm:ml-2"
            style={{ background: "var(--red)", color: "var(--paper)", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 16px", borderRadius: 4, textDecoration: "none" }}>
            Вход
          </Link>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ paddingTop: "12vh" }}>
        {/* stamp */}
        <div className="mb-9 stamp">Държавен зрелостен изпит · Подготовка</div>

        <h1 style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(2.6rem, 7vw, 5.4rem)", lineHeight: 1.06, maxWidth: 860, letterSpacing: "-0.01em" }}>
          <span className="ink-underline">ДЗИ</span> по
          <br />Информационни
          <br />Технологии
        </h1>

        <p className="mt-7" style={{ color: "var(--muted)", fontSize: "clamp(1rem, 2.2vw, 1.15rem)", maxWidth: 520, lineHeight: 1.7 }}>
          Практикувай с реални въпроси от матури, виж обяснения веднага и
          проследи напредъка си по теми.
        </p>

        {/* ticket */}
        <div className="mt-9 w-full" style={{ maxWidth: 460 }}>
          <GameStats />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-10 mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/practice" className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, fontSize: "0.95rem", padding: "14px 30px", borderRadius: 5, minWidth: 210, textDecoration: "none" }}>
              Започни теория
            </Link>
            <Link href="/html-task" className="inline-flex items-center justify-center transition-colors"
              style={{ background: "transparent", color: "var(--paper)", border: "1px solid var(--paper)", fontWeight: 600, fontSize: "0.95rem", padding: "14px 30px", borderRadius: 5, minWidth: 210, textDecoration: "none" }}>
              Започни практика
            </Link>
          </div>
          <Link href="/quiz" className="inline-flex items-center gap-2 transition-colors"
            style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", fontFamily: MONO, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "11px 26px", borderRadius: 5, minWidth: 210, justifyContent: "center", textDecoration: "none" }}>
            Quiz стая →
          </Link>
        </div>

        {/* registry strip */}
        <div className="flex items-stretch mb-20 sm:mb-24" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
          {[
            { value: totalQuestions, label: "въпроса" },
            { value: totalTopics,    label: "теми" },
            { value: "∞",            label: "практики" },
          ].map(({ value, label }, i) => (
            <div key={label} className="text-center px-7 sm:px-10 py-4" style={{ borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 600, color: "var(--paper)", fontSize: "clamp(1.6rem, 4vw, 2.3rem)", lineHeight: 1 }}>{value}</div>
              <div style={{ color: "var(--muted)", fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 7 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 hidden sm:flex"
          style={{ color: "var(--muted)", fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.2em" }}>
          <span>SCROLL</span>
          <span style={{ animation: "bounce 1.8s infinite" }}>↓</span>
        </div>
      </section>

      {/* ── TOPICS ────────────────────────────────────────────────────── */}
      <section id="topics" className="relative z-10 max-w-3xl mx-auto px-6 pb-32">
        <ScrollReveal>
          <h2 className="text-center mb-3" style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)" }}>
            Теми за изпита
          </h2>
          <p className="text-center mb-12" style={{ color: "var(--muted)" }}>
            Избери тема или практикувай всички наведнъж
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map(([topic, count], i) => {
            const meta = TOPIC_META[topic] ?? { color: "var(--paper)", label: topic };
            return (
              <ScrollReveal key={topic} delay={i * 60}>
                <Link href={`/practice?topic=${encodeURIComponent(topic)}`}
                  className="glass flex items-center gap-4 group block relative" style={{ textDecoration: "none", borderRadius: 4, padding: "18px 16px 18px 20px" }}>
                  <span className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: meta.color }} />
                  {/* section-number marker (exam-paper style, no icons) */}
                  <span className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 46, height: 46, border: `1px solid ${meta.color}`, borderRadius: 4, fontFamily: MONO, fontWeight: 600, fontSize: "1.05rem", color: meta.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate" style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "0.98rem" }}>{meta.label}</div>
                    <div style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "0.08em", marginTop: 3 }}>{count} ВЪПРОСА</div>
                  </div>
                  <span className="transition-all opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: "var(--red)", fontSize: "1.1rem" }}>→</span>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={400} className="mt-10 text-center">
          <Link href="/practice" className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, fontSize: "1rem", padding: "15px 34px", borderRadius: 5, textDecoration: "none" }}>
            Практика — всички теми →
          </Link>
        </ScrollReveal>

        {/* footer */}
        <div className="mt-16 flex justify-center gap-8 flex-wrap">
          {[["/rewards", "Награди"], ["/feedback", "Обратна връзка"], ["/privacy", "Поверителност"]].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</Link>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
      `}</style>
    </>
  );
}
